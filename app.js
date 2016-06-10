var app = require('express')(),
	express = require('express'),
	server = require('http').createServer(app),
	io = require('socket.io').listen(server),
	bodyParser = require('body-parser'),
	mongoose = require('mongoose'),
	passport = require('passport'),
	LocalStrategy = require('passport-local').Strategy;

var game = require('./game');
var config = require('./config');

var routeAuthentication = require('./routes/authentication');

app.use(express.static(__dirname + '/public'));
app.set('view engine', 'jade');

app.use('/', routeAuthentication);

app.get('/', function (req, res) {
	//game.roomToJoin = '/tamere';
	res.render(__dirname + '/views/index');
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

// passport config
var User = require('./models/user');
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

mongoose.connect(config.database.location, config.database.options);

//io.of(game.roomToJoin).on('connection', function (socket) {
io.sockets.on('connection', function (socket) {
	//console.log(socket.id);
	socket.emit('game-init', socket.id);


	socket.on('game-ready', function (cells) {
		//console.log('||||||||||||||||||||||||||||||||||||||||||||||||||\n||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||\n||||||||||||||||||||||||||||||||||||||||||||||||||');

		socket.room = 'test';
		socket.ready = true;
		socket.cells = cells;
		socket.join(socket.room);
		var roomClients = io.sockets.adapter.rooms[socket.room];

		var allReady = true;
		//TODO optimize
		if (roomClients.length > 1) {
			for (socketId in roomClients.sockets) {
				if (!io.sockets.sockets[socketId].ready) {
					allReady = false;
					break;
				}
			}
		} else {
			// SEE WHAT TO DO IF HE'S ALONE
		}

		if (allReady) {
			//start count down;
		}


		/*
		console.log(clients_in_the_room.sockets);
		console.log(io.sockets.sockets);
		*/
	});



	/* ROOMS
    socket.on('createRoom', function (name){
        game.rooms.push(name);
        socket.room = name;
        socket.join(name);
        io.sockets.emit('updateRooms', game.rooms);
        socket.join(name);
        socket.emit('joinRoom');
    });
    
    socket.on('getRooms', function (){
        socket.emit('updateRooms', game.rooms);
    });
    
    socket.on('fromWait', function (){
        console.log(socket.room);
    });
	*/
	/* TEST
	console.log(io);
	//socket.on('init', function (data) {});
	if (game.players.length < game.ROOM_MAX_PLAYER &&
	    game.roomToJoin != '/') {
	    socket.player = {
	        ready: false
	    };
	    game.players.push(socket);

	    socket.on('setReady', function () {
	        if (!socket.player.ready) {
	            socket.player.ready = true;
	            if (game.getPlayerReadyCount() == game.players.length &&
	                game.players.length > 1) {
	                io.sockets.emit('startGame', socket.player);
	            }
	        }
	    });
	}

	socket.on('disconnect', function () {
	    var i = game.players.indexOf(socket);
	    game.players.splice(i, 1);
	});

	console.log(game.roomToJoin + ' => ' + 'game.players.length:', game.players.length);
	*/
});

server.listen(3000);