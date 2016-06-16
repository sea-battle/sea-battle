module.exports = {
	start: function (io, game) {
		io.sockets.on('connection', function (socket) {
			// Initialize on connection
			socket.ready = false;
			socket.room = game.defaultRoom;
			socket.join(game.defaultRoom);
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
					name: roomName,
					gameStarted: false,
					turnCount: 0,
					turns: []
				};
				socket.room = roomName;
				socket.leave(game.defaultRoom);
				socket.join(roomName);
				socket.broadcast.emit('rooms-update', game.getRoomsInfos());
				socket.emit('rooms-join', socket.name);
			});
			socket.on('rooms-get', function () {
				socket.emit('rooms-update', game.getRoomsInfos());
			});
			socket.on('rooms-join', function (roomName) {
				socket.room = roomName;
				game.rooms[roomName].playerCount++;
				socket.leave(game.defaultRoom);
				socket.join(roomName);
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
				var playersName = game.getPlayersNames(io.sockets, socket.room);
				socket.broadcast.emit('room-update-players', playersName);
				io.sockets.in(game.defaultRoom).emit('rooms-update', game.getRoomsInfos());
			});

			socket.on('room-update-request', function () {
				var playersName = game.getPlayersNames(io.sockets, socket.room);
				socket.emit('room-update-players', playersName);

				var playersStatus = game.getPlayerStatus(io.sockets, socket.room);
				playersStatus.forEach(function (status) {
					if (socket.name != status.name) {
						socket.emit('update-players-status', status.name, status.ready);
					}
				});
			});

			// Stage 2: wait
			socket.on('wait-set-ready', function () {
				socket.ready = true;
				socket.broadcast.emit('update-players-status', socket.name, 'Prêt');
				if (game.allPlayersAreReady(io.sockets, socket.room) &&
					game.getPlayersId(io.sockets, socket.room).length > 1) {
					io.sockets.emit('wait-start-game');
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
			});
			socket.on('wait-set-unready', function () {
				socket.ready = false;
				socket.broadcast.emit('update-players-status', socket.name, 'Attente');
			});

			// Stage 3: game
			socket.on('game-set-ready', function (cells) {
				socket.cells = cells;
				socket.emit('game-init-players-grids', game.getOtherPlayersInfos(io.sockets, socket));

				// Shoot timer
				if (game.rooms[socket.room].timerId == null) {
					game.rooms[socket.room].timerId = setInterval(function () {
						if (game.rooms[socket.room].timer == 0) {
							game.rooms[socket.room].timer = game.defaultShootTime;

							game.playShootTurn(io.sockets, socket.room);
							//io.sockets.emit('update-after-turn', )
							var currentRoom = game.rooms[socket.room];
							console.log(currentRoom.turns[currentRoom.turnCount].touchedPlayers);
							clearInterval(game.rooms[socket.room].timerId);
						} else {
							io.sockets.emit('game-timer-update', game.rooms[socket.room].timer);
							game.rooms[socket.room].timer--;
						}
					}, 1000);
				}
			});
			socket.on('game-shoot', function (shootCoords, targetId) {
				var currentRoom = game.rooms[socket.room];
				var turnCount = currentRoom.turnCount;
				if (currentRoom.turns[turnCount] == undefined){
					currentRoom.turns[turnCount] = {
						playersShoots: {},
						touchedPlayers: {}
					};
				}
				
				currentRoom.turns[turnCount]['playersShoots'][socket.name] = {
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
			socket.on('chat-filter', function (filter) {
				var messages = game.getMessagesFrom(socket.room, filter);
				socket.emit('chat-filter', messages);
			});

			socket.on('disconnect', function () {
				if (socket.room != game.defaultRoom) {
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
						delete game.rooms[socket.room];
					} else {
						var playersName = game.getPlayersNames(io.sockets, socket.room);
						socket.broadcast.emit('room-update-players', playersName);
					}
				} else {
					socket.leave(game.defaultRoom);
				}

				io.sockets.in(game.defaultRoom).emit('rooms-update', game.getRoomsInfos());
			});
		});
	}
};