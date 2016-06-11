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
	timer: 30
};