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
	defaultShootTime: 5,
	// return players from player room
	getPlayers: function (ioSockets, roomName) {
		return ioSockets.adapter.rooms[roomName];
	},
	allPlayersAreReady: function (ioSockets, roomName) {
		var roomPlayers = this.getPlayers(ioSockets, roomName);
		var allReady = true;
		for (socketId in roomPlayers.sockets) {
			if (!ioSockets.sockets[socketId].ready) {
				allReady = false;
				break;
			}
		}
		
		return allReady;
	},
	getPlayersNames: function (ioSockets, roomName){
		var roomPlayers = this.getPlayers(ioSockets, roomName);	
		var names = [];
		for (socketId in roomPlayers.sockets) {
			names.push(ioSockets.sockets[socketId].name);
		}
		return names;
	}
};