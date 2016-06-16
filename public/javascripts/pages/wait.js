var playerIsReady = false;
var setReadyButton = document.getElementById('set-ready');
var readyStatus = document.getElementById('ready-status');
var playersList = document.getElementById('players-list');
var playerUsername = document.getElementById('player-username');

setReadyButton.addEventListener('click', function (e) {
	playerIsReady = !playerIsReady;
	if (playerIsReady) {
		readyStatus.innerHTML = 'Ready';
		socket.emit('wait-set-ready');
	} else {
		readyStatus.innerHTML = '';
		socket.emit('wait-set-unready');
	}
});

socket.on('wait-start-game', function () {
	ajax.get('/game', handlers);
});

socket.on('room-update-players', function (playersName) {
	var indexToRemove = playersName.indexOf(playerUsername.innerHTML);
	playersName.splice(indexToRemove, 1);

	var otherPlayersRow = document.getElementsByClassName('other-player');
	for (var i = 0; i < otherPlayersRow.length; i++) {
		otherPlayersRow[i].remove();
	}

	playersName.forEach(function (playerName) {
		var li = document.createElement('li');
		var div = document.createElement('div');
		var pUsername = document.createElement('p');
		var pRanking = document.createElement('p');
		var iStatus = document.createElement('i');
		li.id = playerName + '-row';
		li.className = 'other-player';
		pUsername.className = 'player-username';
		pRanking.className = 'player-ranking';
		iStatus.id = 'status-' + playerName;

		pUsername.innerHTML = playerName;
		pRanking.innerHTML = 'Essaye pas de niaiser !';
		iStatus.innerHTML = 'Attente';

		li.appendChild(div);
		div.appendChild(pUsername);
		div.appendChild(pRanking);
		li.appendChild(iStatus);
		playersList.appendChild(li);
	});
});

socket.on('update-players-status', function (playersName, status) {
	var statusToUpdate = document.getElementById('status-' + playersName);
	console.log(statusToUpdate);
	statusToUpdate.innerHTML = status;
});


// to display all player on room joined
socket.emit('room-update-request');