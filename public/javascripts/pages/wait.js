fillPlayersInfos('wait');
var playerIsReady = false;
var setReadyButton = document.getElementById('set-ready');
var readyStatus = document.getElementById('ready-status');
var playersList = document.getElementById('players-list');
var roomName = document.getElementById('room-name');
var roomPlayerCount = document.getElementById('room-player-count');

function updatePlayerList(players) {
	// Remove all players from list but current player
	var otherPlayersRow = document.getElementsByClassName('other-player');
	for (var i = 0; i < otherPlayersRow.length; i++) {
		otherPlayersRow[i].remove();
	}

	players.forEach(function (player) {
		if (playerInfos.id != player.id) {
			var li = document.createElement('li');
			var div = document.createElement('div');
			var pUsername = document.createElement('p');
			var pRanking = document.createElement('p');

			var img = document.createElement('img');
			var wrapper = document.createElement('span');
			var spanGrade = document.createElement('span');
			var spanPoints = document.createElement('span');

			var p = document.createElement('p');
			var iStatus = document.createElement('i');
			li.id = player.id + '-row';
			li.className = 'other-player';
			pUsername.className = 'player-username';
			pRanking.className = 'player-ranking';
			iStatus.id = 'status-' + player.id;
			p.id = 'set-ready';
			p.className = 'ready-status';

			pUsername.innerHTML = player.name;
			img.setAttribute('src', player.img);
            img.setAttribute('alt', 'Grade');

			wrapper.className = 'player-ranking-wrapper';
			spanGrade.innerHTML = player.grade + ' - ';
			spanPoints.innerHTML = player.globalPoints + 'pts';
			iStatus.innerHTML = 'Attente';

			pRanking.appendChild(img);
			wrapper.appendChild(spanGrade);
			wrapper.appendChild(spanPoints);
			pRanking.appendChild(wrapper);
			p.appendChild(iStatus);

			li.appendChild(div);
			div.appendChild(pUsername);
			div.appendChild(pRanking);
			li.appendChild(p);
			playersList.appendChild(li);
		}
	});
}
function updateRoomInfos(room) {
	roomName.innerHTML = room.name;
	if (room.playerCount > 1) {
		var playerCountText = ' Joueurs';
	} else {
		var playerCountText = ' Joueur';
	}
	roomPlayerCount.innerHTML = room.playerCount + playerCountText;
}

socket.on('wait-start-game', function () {
	ajax.get('/game', function (data){
        handlers.onComplete(data);
        initGame();
    });
});
socket.on('room-update', function (infos) {
	updatePlayerList(infos.players);
	updateRoomInfos(infos.room);
});
socket.on('update-players-status', function (playerId, status) {
	var statusToUpdate = document.getElementById('status-' + playerId);
	statusToUpdate.innerHTML = status;
});

// to display all player on room joined
socket.emit('room-update-request');

setReadyButton.addEventListener('click', function (e) {
	playerIsReady = !playerIsReady;
	if (playerIsReady) {
		setReadyButton.innerHTML = 'Prêt !';
		setReadyButton.addClass('ready');
		socket.emit('wait-set-ready');
	} else {
		setReadyButton.innerHTML = 'Prêt ?';
		setReadyButton.removeClass('ready');
		socket.emit('wait-set-unready');
	}
});