var utils = require('./utils'),
	game = require('./game'),
	querystring = require('querystring'),
	http = require('http');

function post(url, codestring, callback) {
	var post_data = querystring.stringify({
		'compilation_level': 'ADVANCED_OPTIMIZATIONS',
		'output_format': 'json',
		'output_info': 'compiled_code',
		'warning_level': 'QUIET',
		'data': JSON.stringify(codestring)
	});
	var post_options = {
		host: 'localhost',
		port: '3000',
		path: url,
		method: 'POST',
		headers: {
			'Content-Type': 'application/x-www-form-urlencoded',
			'Content-Length': Buffer.byteLength(post_data)
		}
	};

	var post_req = http.request(post_options, function (res) {
		res.setEncoding('utf8');
		res.on('data', function (chunk) {
			callback(chunk);
		});
	});
	post_req.write(post_data);
	post_req.end();
}

function get(url, callback) {
	// Build the post string from an object
	var post_data = querystring.stringify({
		'compilation_level': 'ADVANCED_OPTIMIZATIONS',
		'output_format': 'json',
		'output_info': 'compiled_code',
		'warning_level': 'QUIET'
	});

	// An object of options to indicate where to post to
	var post_options = {
		host: 'localhost',
		port: '3000',
		path: url,
		method: 'GET',
		headers: {
			'Content-Type': 'application/x-www-form-urlencoded'
		}
	};

	// Set up the request
	var post_req = http.request(post_options, function (res) {
		res.setEncoding('utf8');
		res.on('data', function (chunk) {
			callback(chunk);
		});
	});
	post_req.end();
}

var socket = {
	start: function (io) {
		var self = this;
		io.sockets.on('connection', function (socket) {
			self.init(socket);

			// Stage 1: rooms
			socket.on('rooms-init-socket-id', function () {
				socket.emit('init-socket-id', socket.id);
			});
			socket.on('rooms-create', function (roomName) {
				self.createRoom(socket, roomName);
			});
			socket.on('rooms-get', function () {
				socket.emit('rooms-update', game.getRoomsInfos());
			});
			socket.on('rooms-join', function (roomName) {
				self.joinRoom(io, socket, roomName);
			});
			socket.on('room-update-request', function () {
				socket.emit('room-update', {
					players: game.getPlayersInfos(io.sockets, socket.room),
					room: {
						playerCount: game.rooms[socket.room].playerCount,
						name: socket.room
					}
				});

				var playersStatus = game.getPlayerStatus(io.sockets, socket.room);
				playersStatus.forEach(function (status) {
					if (socket.id != status.id) {
						socket.emit('update-players-status', status.id, status.ready);
					}
				});
			});

			// Stage 2: wait
			socket.on('wait-set-ready', function () {
				self.waitSetReady(io, socket);
			});
			socket.on('wait-set-unready', function () {
				self.waitSetUnready(socket);
			});

			// Stage 3: game
			socket.on('game-init', function () {
				socket.emit('init', socket.id, game.getPlayersInfos(io.sockets, socket.room));
			});
			socket.on('game-set-ready', function (cells) {
				self.gameSetReady(io, socket, cells);
			});
			socket.on('game-shoot', function (shootCoords) {
				self.shoot(socket, shootCoords);
			});
			socket.on('game-replay', function () {
				socket.ready = false;
				socket.shootInfos = {
					shootCoords: null,
					targetId: null
				};
				socket.cells = null;
				socket.points = 0;
				socket.cellsContainingBoatCount = game.DEFAULT_BOATS_PARTS_COUNT;
				socket.down = false;
				socket.emit('replay-init-done');
			});

			// Chat
			/* TODO
			socket.on('chat-is-writing', function () {
				socket.broadcast.emit('is-writing', socket.name);
			});
			*/
			socket.on('chat-player-message', function (message) {
				if (game.rooms[socket.room] != undefined) {
					var time = game.getMessageTime();
					var filter = 'players-messages';
					game.rooms[socket.room].chat.push({
						filter: filter,
						sender: socket.name,
						message: message,
						time: time
					});
					io.sockets.emit('receive-message', socket.name, message, time, filter);
				}
			});
			socket.on('chat-filter', function (filter) {
				socket.emit('chat-filter', game.getMessagesFrom(socket.room, filter));
			});
			socket.on('disconnect', function () {
				self.disconnect(io, socket);
			});
		});
	},
	init: function (socket) {
		var sessionId = socket.request.sessionID;
		var user = JSON.parse(socket.request.sessionStore.sessions[sessionId]).user;
		socket.ready = false;
		socket.room = game.DEFAULT_ROOM;
		socket.join(game.DEFAULT_ROOM);
		socket.shootInfos = {
			shootCoords: null,
			targetId: null
		};
		socket.name = user.username;
		socket.grade = user.rank;
		socket.globalPoints = user.pointsCount;
		socket.img = user.rankIcon;
		socket.games = user.games;
		socket._id = user._id;
		socket.ip = user.ip

		socket.points = 0;
		socket.cellsContainingBoatCount = game.DEFAULT_BOATS_PARTS_COUNT;
		socket.down = false;
		socket.cells = null;
	},
	createRoom: function (socket, roomName) {
		if (roomName.length > 20) {
			roomName = roomName.substring(0, 19);
		}
		socket.points = 0;
		game.rooms[roomName] = {
			timer: game.defaultPlacementTime,
			timerId: null,
			chat: [],
			playerCount: 1,
			name: roomName,
			gameStarted: false,
			turnCount: 0,
			turns: []
		};
		socket.room = roomName;
		socket.leave(game.DEFAULT_ROOM);
		socket.join(roomName);
		game.inGameIps.push(socket.ip);
		socket.broadcast.emit('rooms-update', game.getRoomsInfos());
		socket.emit('rooms-join', socket.name);
	},
	joinRoom: function (io, socket, roomName) {
		//if (game.inGameIps.indexOf(socket.ip) == -1) {
		if (!game.rooms[roomName].gameStarted &&
			game.rooms[roomName].playerCount < game.ROOM_MAX_PLAYER) {
			socket.points = 0;
			socket.room = roomName;
			game.rooms[roomName].playerCount++;
			socket.leave(game.DEFAULT_ROOM);
			socket.join(roomName);
			game.inGameIps.push(socket.ip);
			socket.emit('rooms-join', socket.name);

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
			socket.broadcast.emit('room-update', {
				players: game.getPlayersInfos(io.sockets, socket.room),
				room: {
					playerCount: game.rooms[socket.room].playerCount,
					name: roomName
				}
			});
			io.sockets.in(game.DEFAULT_ROOM).emit('rooms-update', game.getRoomsInfos());
		}
		/*
		} else {
			//TODO return message
			socket.emit('already-in-room');
		}*/
	},
	waitSetReady: function (io, socket) {
		socket.ready = true;
		socket.broadcast.emit('update-players-status', socket.id, 'Prêt');
		if (game.allPlayersAreReady(io.sockets, socket.room) &&
			game.getPlayersId(io.sockets, socket.room).length > 1) {
			io.sockets.emit('wait-start-game');
			game.rooms[socket.room].gameStarted = true;
			io.sockets.in(game.DEFAULT_ROOM).emit('rooms-update', game.getRoomsInfos());
			game.rooms[socket.room].timerId = setInterval(function () {
				if (game.rooms[socket.room].timer == 0) {
					game.rooms[socket.room].timer = game.defaultShootTime;
					// Check if player grid is ready
					io.sockets.emit('game-check-grid');
					clearInterval(game.rooms[socket.room].timerId);
					game.rooms[socket.room].gameStarted = true;
					game.rooms[socket.room].timerId = null;
				} else {
					io.sockets.emit('game-timer-update', game.rooms[socket.room].timer);
					game.rooms[socket.room].timer--;
				}
			}, 1000);
		}
	},
	waitSetUnready: function (socket) {
		socket.ready = false;
		socket.broadcast.emit('update-players-status', socket.id, 'Attente');
	},
	gameSetReady: function (io, socket, cells) {
		socket.cells = cells;
		socket.emit('game-init-players-grids', game.getPlayersInfos(io.sockets, socket.room));

		function playTurn() {
			if (game.rooms[socket.room].timer == 0) {
				game.playShootTurn(io.sockets, socket.room);
				var currentRoom = game.rooms[socket.room];
				if (!utils.isEmpty(currentRoom.turns[currentRoom.turnCount].touchedPlayers)) {
					io.sockets.emit('update-after-turn', currentRoom.turns[currentRoom.turnCount].touchedPlayers, game.getPlayersInfos(io.sockets, socket.room, 'points'));
				}

				var gameState = game.checkDownGrids(io.sockets, socket.room);
				if (gameState.gameover) {
					clearInterval(game.rooms[socket.room].timerId);
					var players = game.getPlayers(io.sockets, socket.room);
					players.forEach(function (p) {
						post('/update-player', {
							_id: p._id,
							gamePoints: p.points,
							globalPoints: p.globalPoints,
							games: p.games
						}, function () {});
					});
					io.sockets.in(socket.room).emit('gameover', gameState.winners);

				} else {
					currentRoom.turnCount++;
					game.rooms[socket.room].timer = game.defaultShootTime;
				}
			} else {
				var currentRoom = game.rooms[socket.room];
				var turnCount = currentRoom.turnCount;
				if (currentRoom.turns[turnCount] == undefined) {
					currentRoom.turns[turnCount] = {
						playersShoots: {},
						touchedPlayers: {}
					};
				}
				io.sockets.emit('game-timer-update', game.rooms[socket.room].timer);
				game.rooms[socket.room].timer--;
			}
		}

		// Shoot timer
		if (game.rooms[socket.room].timerId == null) {
			game.rooms[socket.room].timerId = setInterval(playTurn, 1000);
		}
	},
	shoot: function (socket, shootCoords) {
		if (!socket.down) {
			var currentRoom = game.rooms[socket.room];
			var turnCount = currentRoom.turnCount;
			if (currentRoom.turns[turnCount] == undefined) {
				currentRoom.turns[turnCount] = {
					playersShoots: {},
					touchedPlayers: {}
				};
			}

			currentRoom.turns[turnCount]['playersShoots'][socket.id] = {
				shootCoords: shootCoords,
				shooterName: socket.name
			};
		}
	},
	disconnect: function (io, socket) {
		if (socket.room != game.DEFAULT_ROOM) {
			var from = 'System';
			var message = socket.name + ' left the game.';
			var time = game.getMessageTime();
			var filter = 'game-messages';
			game.rooms[socket.room].chat.push({
				filter: filter,
				sender: from,
				message: message,
				time: time
			});
			socket.broadcast.emit('receive-message', from, message, time, filter);
			socket.leave(socket.room);
			game.rooms[socket.room].playerCount--;
			if (game.rooms[socket.room].playerCount == 0) {
				if (game.rooms[socket.room].timerId != null) {
					clearInterval(game.rooms[socket.room].timerId);
				}

				delete game.rooms[socket.room];
			} else if (game.rooms[socket.room].playerCount == 1) {
				if (game.rooms[socket.room].timerId != null) {
					clearInterval(game.rooms[socket.room].timerId);
				}
				socket.broadcast.emit('room-update', {
					players: game.getPlayersInfos(io.sockets, socket.room),
					room: {
						playerCount: game.rooms[socket.room].playerCount,
						name: socket.room
					}
				});
				//TODO set the only one missing as winner and bring him back to wait room
			} else {
				socket.broadcast.emit('room-update', {
					players: game.getPlayersInfos(io.sockets, socket.room),
					room: {
						playerCount: game.rooms[socket.room].playerCount,
						name: socket.room
					}
				});
			}
		} else {
			socket.leave(game.DEFAULT_ROOM);
		}

		io.sockets.in(game.DEFAULT_ROOM).emit('rooms-update', game.getRoomsInfos());
	}
};

module.exports = socket;