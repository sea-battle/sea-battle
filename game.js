var utils = require('./utils');

module.exports = {
    defaultRoom: '/',
    rooms: {},
    ROOM_MAX_PLAYER: 6,
    getPlayerReadyCount: function () {
        var count = 0;
        for (var i = 0; i < this.players.length; i++) {
            if (this.players[i].player.ready) {
                count++;
            }
        }
        return count;
    },
    defaultPlacementTime: 1,
    defaultShootTime: 3,
    // return players from player room
    getPlayersId: function (ioSockets, roomName) {
        console.log(ioSockets.adapter.rooms);
        return ioSockets.adapter.rooms[roomName];
    },
    allPlayersAreReady: function (ioSockets, roomName) {
        var roomPlayers = this.getPlayersId(ioSockets, roomName);
        var allReady = true;
        for (socketId in roomPlayers.sockets) {
            if (!ioSockets.sockets[socketId].ready) {
                allReady = false;
                break;
            }
        }

        return allReady;
    },
    getPlayersNames: function (ioSockets, roomName) {
        var roomPlayers = this.getPlayersId(ioSockets, roomName);
        var names = [];
        for (socketId in roomPlayers.sockets) {
            names.push(ioSockets.sockets[socketId].name);
        }
        return names;
    },
    getPlayerCellsById(ioSockets, id) {
        return this.getPlayerById(ioSockets, id).cells;
    },
    getPlayers: function (ioSockets, roomName) {
        var roomPlayers = this.getPlayersId(ioSockets, roomName);
        var players = [];
        for (socketId in roomPlayers.sockets) {
            players.push(ioSockets.sockets[socketId]);
        }
        return players;
    },
    getPlayersInfos: function (ioSockets, socketRoom, sort) {
        var roomPlayers = this.getPlayersId(ioSockets, socketRoom);
        console.log(roomPlayers);
        var players = [];
        for (socketId in roomPlayers.sockets) {
            players.push({
                name: ioSockets.sockets[socketId].name,
                id: ioSockets.sockets[socketId].id,
                points: ioSockets.sockets[socketId].points,
                globalPoints: ioSockets.sockets[socketId].globalPoints,
                grade: ioSockets.sockets[socketId].grade,
                img: ioSockets.sockets[socketId].img
            });
        }
        if (sort) {
            players.sort(utils.sortingBy[sort]);
        }

        return players;
    },
    getPlayerById: function (ioSockets, id) {
        return ioSockets.sockets[id];
    },
    playShootTurn: function (ioSockets, roomName) {
        var self = this;
        var lastTurnIndex = this.rooms[roomName].turns.length - 1;
        if (!utils.isEmpty(this.rooms[roomName].turns[lastTurnIndex]['playersShoots'])) {
            var lastTurn = this.rooms[roomName].turns[lastTurnIndex]['playersShoots'];
            var touchedPlayers = {};
            var playersIds = this.getPlayersId(ioSockets, roomName);
            for (var key in lastTurn) {
                var socketTurn = lastTurn[key];
                for (var socketId in playersIds.sockets) {
                    if (socketId != key) {
                        var currentSocketCells = this.getPlayerById(ioSockets, socketId).cells;
                        currentSocketCells[socketTurn.shootCoords.x][socketTurn.shootCoords.y].shooted = true;
                        currentSocketCells[socketTurn.shootCoords.x][socketTurn.shootCoords.y].shootedBy.push(key);

                        if (touchedPlayers[socketId] == undefined) {
                            touchedPlayers[socketId] = {
                                touchedAt: []
                            };
                        }
                        var touched = currentSocketCells[socketTurn.shootCoords.x][socketTurn.shootCoords.y].containBoat;
                        if (touched) {
                            var shooterPlayer = self.getPlayerById(ioSockets, key);
                            shooterPlayer.points++;
                        }

                        touchedPlayers[socketId].touchedAt.push({
                            coords: socketTurn.shootCoords,
                            by: socketTurn.shooterName,
                            touched: touched
                        });
                    }
                }
            }

            this.rooms[roomName].turns[lastTurnIndex].touchedPlayers = touchedPlayers;
        }
    },
    getMessageTime: function () {
        var d = new Date();
        var hours = d.getHours();
        var mins = d.getMinutes();
        if (mins < 10) {
            mins = '0' + mins;
        }
        return hours + ':' + mins;
    },
    getRoomsInfos: function () {
        var roomsInfos = [];
        for (var key in this.rooms) {
            if (!this.rooms[key].gameStarted) {
                roomsInfos.push({
                    name: this.rooms[key].name,
                    playerCount: this.rooms[key].playerCount
                });
            }
        }
        return roomsInfos;
    },
    getMessagesFrom: function (room, filter) {
        var filteredMessages = [];
        var needFilter = false;

        if (filter != 'all-messages') {
            needFilter = true;
        }

        this.rooms[room].chat.forEach(function (message) {
            if (needFilter) {
                if (message.filter == filter) {
                    filteredMessages.push(message);
                }
            } else {
                filteredMessages.push(message);
            }
        });
        return filteredMessages;
    },
    getPlayerStatus: function (ioSockets, roomName) {
        var roomPlayers = this.getPlayersId(ioSockets, roomName);
        var players = [];
        for (socketId in roomPlayers.sockets) {
            players.push({
                id: ioSockets.sockets[socketId].id,
                ready: ioSockets.sockets[socketId].ready ? 'Prêt' : 'Attente'
            });
        }
        return players;
    }
};