var app = require('express')(),
    bodyParser = require('body-parser'),
	express = require('express'),
    io = require('socket.io').listen(server),
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

app.get('/database', function (req, res) {
});
app.get('/rooms', function (req, res) {
	res.render(__dirname + '/views/rooms');
});
app.get('/wait', function (req, res) {
	res.render(__dirname + '/views/wait');
});
app.get('/game', function (req, res) {
	res.render(__dirname + '/views/game');
});
app.get('*', function (req, res) {
	res.render(__dirname + '/views/404');
});

mongoose.connect(config.database.location, config.database.options);

io.sockets.on('connection', function (socket) {
	// Init on connection
	game.rooms['test'] = {
		timer: game.defaultPlacementTime,
		timerId: null
	};
	socket.ready = false;
	socket.room = 'test';
	socket.name = socket.id;
	socket.join(socket.room);

	// Wait stage
	socket.on('wait-set-ready', function () {
		socket.ready = true;
		if (game.allPlayersAreReady(io.sockets, socket.room) &&
			game.getPlayers(io.sockets, socket.room).length > 1) {
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
		socket.emit('game-init-players-grids', game.getPlayersNames(io.sockets, socket.room));
	});
});

server.listen(3000);