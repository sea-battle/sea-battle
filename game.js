module.exports = {
	roomToJoin: '/', // default
	rooms: [],
	ROOM_MAX_PLAYER: 6,
	players: [],
	getPlayerReadyCount: function () {
		var count = 0;
		for (var i = 0; i < this.players.length; i++) {
			if (this.players[i].player.ready) {
				count++;
			}
		}
		return count;
	},
	timer: 30,
	// return players from player room
	getPlayers: function (ioSockets, socket) {
		return ioSockets.adapter.rooms[socket.room];
	},
	allPlayersAreReady: function (ioSockets, socket) {
		var roomPlayers = this.getPlayers(ioSockets, socket);
		var allReady = true;
		for (socketId in roomPlayers.sockets) {
			if (!ioSockets.sockets[socketId].ready) {
				allReady = false;
				break;
			}
		}
		
		return allReady;
	}
};