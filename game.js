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
	defaultShootTime: 7,
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
		var self = this;
		var lastTurnIndex = this.rooms[roomName].turns.length - 1;
		var lastTurn = this.rooms[roomName].turns[lastTurnIndex]['playersShoots'];
		var touchedPlayers = {};
		for (key in lastTurn) {
			var socketTurn = lastTurn[key];
			var targetedSocket = self.getPlayerById(ioSockets, socketTurn.targetId);
			targetedSocket.cells[socketTurn.shootCoords.x][socketTurn.shootCoords.y].shooted = true;
			targetedSocket.cells[socketTurn.shootCoords.x][socketTurn.shootCoords.y].shootedBy.push(key);

			if (touchedPlayers[socketTurn.targetId] == undefined) {
				touchedPlayers[socketTurn.targetId] = {
					touchedAt: []
				};
			}

			touchedPlayers[socketTurn.targetId].touchedAt.push({
				coords: socketTurn.shootCoords,
				by: socketTurn.shooterName
			});
		}
		
		this.rooms[roomName].turns[lastTurnIndex].touchedPlayers = touchedPlayers;
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
			roomsInfos.push({
				name: this.rooms[key].name,
				playerCount: this.rooms[key].playerCount
			});
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
				name: ioSockets.sockets[socketId].name,
				ready: ioSockets.sockets[socketId].ready ? 'Prêt' : 'Attente'
			});
		}
		return players;
	}
};