var app = require('express')(),
    bodyParser = require('body-parser'),
    express = require('express'),
    jade = require('jade'),
    mongoose = require('mongoose'),
    morgan = require('morgan'),
    server = require('http').createServer(app),
    io = require('socket.io').listen(server);

var config = require('./config'),
    game = require('./game');

// Log everything to the console
app.use(morgan('dev'));

// Get informations from HTML forms. Needs to be loaded before routesAuthentication
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: true
}));

// Load all routes and middlewares required for authentication
var routesAuthentication = require('./routes/authentication');
app.use('/', routesAuthentication);

// Load stylesheets, JavaScript files, images and fonts
app.use(express.static(__dirname + '/public'));

// Set templating engine
app.set('view engine', 'jade');

app.get('/', function (req, res) {
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
    var html = fn(/* Variables */);
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

mongoose.connect(config.database.location, config.database.options);

io.sockets.on('connection', function (socket) {
    // Initialize on connection
    socket.ready = false;
    socket.room = '';
    socket.shootInfos = {
        shootCoords: null,
        targetId: null
    };
    socket.name = socket.id;

    // Stage 1: rooms
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
        var filter = 'game-messages';
        game.rooms[socket.room].chat.push({
            filter: filter,
            sender: from,
            message: message,
            time: time
        });
        socket.broadcast.emit('receive-message', from, message, time, filter);
    });

    // Stage 2: wait
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

    // Stage 3: game
    socket.on('game-set-ready', function (cells) {
        socket.cells = cells;
        socket.emit('game-init-players-grids', game.getOtherPlayersInfos(io.sockets, socket));

        // Shoot timer
        game.rooms[socket.room].timerId = setInterval(function () {
            if (game.rooms[socket.room].timer == 0) {
                // game.rooms[socket.room].timer = game.defaultShootTime;

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

    // Chat
    socket.on('chat-is-writing', function () {
        socket.broadcast.emit('is-writing', socket.name);
    });
    socket.on('chat-player-message', function (message) {
        var time = game.getMessageTime();
        var filter = 'players-messages';
        game.rooms[socket.room].chat.push({
            filter: filter,
            sender: socket.name,
            message: message,
            time: time
        });
        io.sockets.emit('receive-message', socket.name, message, time, filter);
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

server.listen(3000, '0.0.0.0');
