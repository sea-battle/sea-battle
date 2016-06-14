var app = require('express')(),
    bodyParser = require('body-parser'),
	express = require('express'),
    io = require('socket.io').listen(server),
    jade = require('jade'),
    mongoose = require('mongoose'),
    morgan = require('morgan'),
	server = require('http').createServer(app);

var game = require('./game');

var config = require('./config');

app.use(morgan('dev'));

// Get informations from HTML forms. Needs to be loaded before routesAuthentication
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: true
}));

// Load all routes and middlewares required for authentication
var routesAuthentication = require('./routes/authentication');
app.use('/', routesAuthentication);

app.use(express.static(__dirname + '/public'));
app.set('view engine', 'jade');

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
app.get('/manage-account', function (req, res) {
    res.render(__dirname + '/views/manage-account', {
        bodyClass: 'manage-account'
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
        game.roomsName.push(roomName);
        game.rooms[roomName] = {
            timer: game.defaultPlacementTime,
            timerId: null,
            chat: []
        };
        socket.room = roomName;
        socket.join(roomName);
        io.sockets.emit('rooms-update', game.roomsName);
        socket.emit('rooms-join');
    });
    socket.on('rooms-get', function () {
        socket.emit('rooms-update', game.roomsName);
    });
    socket.on('rooms-join', function (roomName) {
        socket.room = roomName;
        socket.join(roomName);
        socket.emit('rooms-join');
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
        console.log(message);
        game.rooms[socket.room].chat.push({
            sender: socket.name,
            message: message
        });
        io.sockets.emit('receive-message', socket.name, message);
    });
});

server.listen(3000);