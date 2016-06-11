var socket = io();
var playerIsReady = false;
var setReadyButton = document.getElementById('set-ready');
var readyStatus = document.getElementById('ready-status');

setReadyButton.addEventListener('click', function (e) {
	playerIsReady = !playerIsReady;
	if (playerIsReady){
		readyStatus.innerHTML = 'Ready';
		socket.emit('wait-set-ready');
	}else{
		readyStatus.innerHTML = '';
		socket.emit('wait-set-unready');	
	}
});

socket.on('wait-start-game', function () {
	document.getElementById('wait-stage').style.display = 'none';
	document.getElementById('game-stage').style.display = 'block';
});