var app = require('express')(),
    express = require('express'),
    server = require('http').createServer(app),
    io = require('socket.io').listen(server),
    bodyParser = require('body-parser'),
    mongoose = require('mongoose'),
    passport = require('passport'),
    jade = require('jade'),
    LocalStrategy = require('passport-local').Strategy;

var game = require('./game');
var config = require('./config');

var routeAuthentication = require('./routes/authentication');

app.use(express.static(__dirname + '/public'));
app.set('view engine', 'jade');

app.use('/', routeAuthentication);
app.get('/', function (req, res) {
    //game.roomToJoin = '/tamere';
    res.render(__dirname + '/views/index', {
        bodyClass: 'home'
    });
});
app.get('/rooms', function (req, res) {
    res.render(__dirname + '/views/rooms', {
        bodyClass: 'rooms'
    });
});
app.get('/profile', function (req, res) {
    res.render(__dirname + '/views/profile', {
        bodyClass: 'profile'
    });
});
app.get('/signup', function (req, res) {
    res.render(__dirname + '/views/signup', {
        bodyClass: 'signup'
    });
});
app.get('/wait', function (req, res) {
    var fn = jade.compileFile(__dirname + '/views/wait.jade');
    var html = fn( /*Variables*/ );
    return res.json({
        bodyClass: 'wait',
        html: html,
        scriptsSrc: [
            '/javascripts/pages/wait.js',
            '/javascripts/chat.js'
        ],
        title: 'Prepare to fight',
    });
});
app.get('/game', function (req, res) {
    var fn = jade.compileFile(__dirname + '/views/game.jade');
    var html = fn();
    return res.json({
        bodyClass: 'game',
        html: html,
        scriptsSrc: [
            '/javascripts/grid.js',
            '/javascripts/boat.js',
            '/javascripts/pages/game.js',
        ],
        title: 'Let\'s shoot'
    });
});
app.get('*', function (req, res) {
    res.render(__dirname + '/views/404', {
        bodyClass: '404'
    });
});

// passport config
var User = require('./models/user');
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

mongoose.connect(config.database.location, config.database.options);

io.sockets.on('connection', function (socket) {
    // INIT ON CONNECTION
    socket.ready = false;
    socket.room = '';
    socket.shootInfos = {
        shootCoords: null,
        targetId: null
    };
    socket.name = socket.id;

    // ROOMS STAGE
    socket.on('rooms-create', function (roomName) {
        game.rooms[roomName] = {
            timer: game.defaultPlacementTime,
            timerId: null,
            chat: [],
            playerCount: 1,
            name: roomName
        };
        socket.room = roomName;
        socket.join(roomName);
        socket.broadcast.emit('rooms-update', game.getRoomsInfos());
        socket.emit('rooms-join');
    });
    socket.on('rooms-get', function () {
        socket.emit('rooms-update', game.getRoomsInfos());
    });
    socket.on('rooms-join', function (roomName) {
        socket.room = roomName;
        game.rooms[roomName].playerCount++;
        socket.join(roomName);
        socket.emit('rooms-join');

        var from = 'System';
        var message = socket.name + ' join the game.';
        var time = game.getMessageTime();
        game.rooms[socket.room].chat.push({
            filter: 'game-messages',
            sender: from,
            message: message,
            time: time
        });
        socket.broadcast.emit('receive-message', from, message, time);
    });

    // WAIT STAGE
    socket.on('wait-set-ready', function () {
        socket.ready = true;
        if (game.allPlayersAreReady(io.sockets, socket.room) &&
            game.getPlayersId(io.sockets, socket.room).length > 1) {
            io.sockets.emit('wait-start-game');
            game.rooms[socket.room].timerId = setInterval(function () {
                if (game.rooms[socket.room].timer == 0) {
                    game.rooms[socket.room].timer = game.defaultShootTime;
                    // Check if player grid is ready
                    io.sockets.emit('game-check-grid');
                    clearInterval(game.rooms[socket.room].timerId);
                } else {
                    io.sockets.emit('game-timer-update', game.rooms[socket.room].timer);
                    game.rooms[socket.room].timer--;
                }
            }, 1000);
        }
    });
    socket.on('wait-set-unready', function () {
        socket.ready = false;
    });

    // GAME STAGE
    socket.on('game-set-ready', function (cells) {
        socket.cells = cells;
        socket.emit('game-init-players-grids', game.getOtherPlayersInfos(io.sockets, socket));

        // Shoot timer
        game.rooms[socket.room].timerId = setInterval(function () {
            if (game.rooms[socket.room].timer == 0) {
                //game.rooms[socket.room].timer = game.defaultShootTime;

                game.playShootTurn(io.sockets, socket.room);
                socket.emit('test', socket.cells);

                clearInterval(game.rooms[socket.room].timerId);
            } else {
                io.sockets.emit('game-timer-update', game.rooms[socket.room].timer);
                game.rooms[socket.room].timer--;
            }
        }, 1000);
    });
    socket.on('game-shoot', function (shootCoords, targetId) {
        socket.shootInfos = {
            shootCoords: shootCoords,
            targetId: targetId
        };
    });

    // CHAT
    socket.on('chat-is-writing', function () {
        socket.broadcast.emit('is-writing', socket.name);
    });
    socket.on('chat-player-message', function (message) {
        var time = game.getMessageTime();
        game.rooms[socket.room].chat.push({
            filter: 'players-messages',
            sender: socket.name,
            message: message,
            time: time
        });

        io.sockets.emit('receive-message', socket.name, message, time);
    });
    socket.on('chat-filter', function (filter){
        var messages = game.getMessagesFrom(socket.room, filter);
        socket.emit('chat-filter', messages);
    });

    socket.on('disconnect', function () {
        if (socket.room != '') {
            socket.leave(socket.room);
            game.rooms[socket.room].playerCount--;
            if (game.rooms[socket.room].playerCount == 0) {
                delete game.rooms[socket.room];
            }
            socket.broadcast.emit('rooms-update', game.getRoomsInfos());
        }
    });
});

server.listen(3000);