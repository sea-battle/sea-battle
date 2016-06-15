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
	ajax.get('/game', handlers);
});

socket.on('room-update', function (playerName) {
	console.log(playerName);
    var li = document.createElement('li');
    var div = document.createElement('div');
    var pUsername = document.createElement('p');
    var pRanking = document.createElement('p');
    var buttonReady = document.createElement('button');
    var iStatus = document.createElement('i');
    
    pUsername.className = 'player-username';
    pRanking.className = 'player-ranking';
    buttonReady.className = 'button-effect';
    iStatus.className = 'ready-status';
    
    /*
    <li><div><p class="player-username">Pseudo</p><p class="player-ranking">Image Grade X pts</p></div><button id="set-ready" class="button-effect">Prêt<i id="ready-status"></i></button></li>
    */
});