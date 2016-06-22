var utils = require('./utils');

module.exports = {
    start: function (io, game) {
        io.sockets.on('connection', function (socket) {
            socket.on('init-socket', function (player) {
                socket.ready = false;
                socket.room = game.DEFAULT_ROOM;
                socket.join(game.DEFAULT_ROOM);
                socket.shootInfos = {
                    shootCoords: null,
                    targetId: null
                };
                socket.name = player.name;
                socket.grade = player.grade;
                socket.globalPoints = player.globalPoints;
                socket.img = player.img;
                socket.points = 0;
                socket.cellsContainingBoatCount = game.DEFAULT_BOATS_PARTS_COUNT;
                socket.down = false;
                socket.cells = null;
            });

            // Stage 1: rooms
            socket.on('rooms-init-socket-id', function () {
                socket.emit('init-socket-id', socket.id);
            });
            socket.on('rooms-create', function (roomName) {
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
                socket.broadcast.emit('rooms-update', game.getRoomsInfos());
                socket.emit('rooms-join', socket.name);
            });
            socket.on('rooms-get', function () {
                socket.emit('rooms-update', game.getRoomsInfos());
            });
            socket.on('rooms-join', function (roomName) {
                if (!game.rooms[roomName].gameStarted &&
                    game.rooms[roomName].playerCount < game.ROOM_MAX_PLAYER) {
                    socket.points = 0;
                    socket.room = roomName;
                    game.rooms[roomName].playerCount++;
                    socket.leave(game.DEFAULT_ROOM);
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
                    socket.broadcast.emit('room-update', {
                        players: game.getPlayersInfos(io.sockets, socket.room),
                        room: {
                            playerCount: game.rooms[socket.room].playerCount,
                            name: roomName
                        }
                    });
                    io.sockets.in(game.DEFAULT_ROOM).emit('rooms-update', game.getRoomsInfos());
                }
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
            });
            socket.on('wait-set-unready', function () {
                socket.ready = false;
                socket.broadcast.emit('update-players-status', socket.id, 'Attente');
            });

            // Stage 3: game
            socket.on('game-init', function () {
                socket.emit('init', socket.id, game.getPlayersInfos(io.sockets, socket.room));
            });

            socket.on('game-set-ready', function (cells) {
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
            });
            socket.on('game-shoot', function (shootCoords) {
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
            });
            
            socket.on('game-replay', function (){
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
            socket.on('chat-is-writing', function () {
                socket.broadcast.emit('is-writing', socket.name);
            });
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
                var messages = game.getMessagesFrom(socket.room, filter);
                socket.emit('chat-filter', messages);
            });

            socket.on('disconnect', function () {
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
            });
        });
    }
};