var utils = require('./utils');

module.exports = {
    DEFAULT_ROOM: '/',
    ROOM_MAX_PLAYER: 6,
    DEFAULT_BOATS_PARTS_COUNT: 17,
    rooms: {},
    defaultPlacementTime: 30,
    defaultShootTime: 10,
    inGameIps: [],
    getPlayersId: function (ioSockets, roomName) {
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
                        var currentSocket = this.getPlayerById(ioSockets, socketId);
                        var currentSocketCells = currentSocket.cells;

                        var touched = currentSocketCells[socketTurn.shootCoords.x][socketTurn.shootCoords.y].containBoat;
                        // Prevent two decrements x times cellsContainingBoatCount if two players shooted the same cell.
                        if (!currentSocketCells[socketTurn.shootCoords.x][socketTurn.shootCoords.y].shooted && touched) {
                            currentSocket.cellsContainingBoatCount--;
                            if (currentSocket.cellsContainingBoatCount == 0) {
                                currentSocket.down = true;
                            }
                        }

                        currentSocketCells[socketTurn.shootCoords.x][socketTurn.shootCoords.y].shooted = true;
                        currentSocketCells[socketTurn.shootCoords.x][socketTurn.shootCoords.y].shootedBy.push(key);

                        if (touchedPlayers[socketId] == undefined) {
                            touchedPlayers[socketId] = {
                                touchedAt: []
                            };
                        }

                        if (touched) {
                            var shooterPlayer = self.getPlayerById(ioSockets, key);
                            shooterPlayer.points++;
                        }

                        touchedPlayers[socketId].touchedAt.push({
                            coords: socketTurn.shootCoords,
                            by: socketTurn.shooterName,
                            byId: key,
                            touched: touched
                        });
                    }
                }
            }

            this.rooms[roomName].turns[lastTurnIndex].touchedPlayers = touchedPlayers;
            this.rooms[roomName].turns[lastTurnIndex].alivePlayers = JSON.parse(JSON.stringify(this.getAlivePlayers(ioSockets, roomName)));
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
            if (!this.rooms[key].gameStarted &&
                this.rooms[key].playerCount < this.ROOM_MAX_PLAYER) {
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
    },
    checkDownGrids: function (ioSockets, roomName) {
        var alivePlayers = this.getAlivePlayers(ioSockets, roomName);
        if (alivePlayers.length == 1) {
            return {
                winners: alivePlayers,
                gameover: true,
            };
        } else {
            if (alivePlayers == 0) {
                //You must ckeck in last turn the members that was still playing and say that they are the winners
                var roomTurns = game.rooms[roomName].turns;
                return {
                    winners: roomTurns[roomTurns.length - 2].alivePlayers,
                    gameover: true
                }
            }

            return {
                playersAlive: alivePlayers,
                gameover: false
            };
        }
    },
    getAlivePlayers: function (ioSockets, roomName) {
        var roomPlayers = this.getPlayers(ioSockets, roomName);
        var alivePlayers = [];
        roomPlayers.forEach(function (player) {
            if (!player.down) {
                alivePlayers.push({
                    name: player.name,
                    id: player.id,
                    points: player.points
                });
            }
        });
        return alivePlayers;
    }
};