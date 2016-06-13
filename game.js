module.exports = {
    rooms: [],
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
    defaultPlacementTime: 2,
    defaultShootTime: 15,
    // return players from player room
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
    getPlayersNames: function (ioSockets, roomName) {
        var roomPlayers = this.getPlayersId(ioSockets, roomName);
        var names = [];
        for (socketId in roomPlayers.sockets) {
            names.push(ioSockets.sockets[socketId].name);
        }
        return names;
    },
    getPlayers: function (ioSockets, roomName) {
        var roomPlayers = this.getPlayersId(ioSockets, roomName);
        var players = [];
        for (socketId in roomPlayers.sockets) {
            players.push(ioSockets.sockets[socketId]);
        }
        return players;
    },
    getOtherPlayersInfos: function (ioSockets, socket) {
        var roomPlayers = this.getPlayersId(ioSockets, socket.room);
        var players = [];
        for (socketId in roomPlayers.sockets) {
            if (socket.id != socketId) {
                players.push({
                    name: ioSockets.sockets[socketId].name,
                    id: ioSockets.sockets[socketId].id
                });
            }
        }
        return players;
    },
    getPlayerById: function (ioSockets, id) {
        return ioSockets.sockets[id];
    },
    playShootTurn: function (ioSockets, roomName) {
        var roomPlayers = this.getPlayers(ioSockets, roomName);
        for (var i = 0; i < roomPlayers.length; i++) {
            var player = this.getPlayerById(ioSockets, roomPlayers[i].id);
            if (player.shootInfos.shootCoords != null &&
                player.shootInfos.targetId) {
                var target = this.getPlayerById(ioSockets, player.shootInfos.targetId);
                var x = player.shootInfos.shootCoords.x,
                    y = player.shootInfos.shootCoords.y
                target.cells[x][x].shooted = true;
                target.cells[x][x].shootedBy.push(player.id);
            }
        }
    }
};