var socket = io();
var createRoomButton = document.getElementById('create-room');
var roomsContainer = document.getElementById('rooms');
var roomNameInput = document.getElementById('room-name-input');

function joinHandler(e) {
    socket.emit('rooms-join', this.getAttribute('data-room'));
}

function addRoom(roomName, playerCount) {
    var newLi = document.createElement('li');
    newLi.setAttribute('data-room-name', roomName);
    var pRoomName = document.createElement('p');
    var pPlayersCount = document.createElement('p');
    var buttonJoin = document.createElement('button');
    var leftDiv = document.createElement('div');

    pRoomName.innerHTML = roomName;
    pRoomName.className = 'room-name';
    pPlayersCount.innerHTML = playerCount > 1 ? playerCount + ' joueurs' : playerCount + ' joueur';
    pPlayersCount.className = 'players-count';
    buttonJoin.innerHTML = 'Rejoindre';
    buttonJoin.className = 'button-effect';
    buttonJoin.setAttribute('data-room', roomName);
    buttonJoin.addEventListener('click', joinHandler);
    leftDiv.appendChild(pRoomName);
    leftDiv.appendChild(pPlayersCount);
    leftDiv.className = 'room-info';

    newLi.appendChild(leftDiv);
    newLi.appendChild(buttonJoin);

    roomsContainer.appendChild(newLi);
}

function fillPlayersInfos(page) {
    var pseudo = document.getElementById('player-username');
    var grade = document.getElementById('player-grade');

    pseudo.innerHTML = playerInfos.name;
    grade.innerHTML = playerInfos.grade + ' - ' + playerInfos.globalPoints + 'pts';

    if (page) {
        if (page == 'wait') {
            document.getElementById('room-player-grade-img').setAttribute('src', playerInfos.img);
            document.getElementById('room-player-username').innerHTML = playerInfos.name;
            document.getElementById('room-player-grade').innerHTML = playerInfos.grade + ' - ';
            document.getElementById('room-player-points').innerHTML = playerInfos.globalPoints + 'pts';
        }
    }
}
socket.emit('rooms-init-socket-id');
socket.on('init-socket-id', function (id) {
    playerInfos.id = id;
});

socket.on('rooms-join', function (name) {
    ajax.get('/wait', function (data) {
        handlers.onComplete(data);
        initWait();
    });
});


createRoomButton.addEventListener('click', function (e) {
    var name = roomNameInput.value;
    if (name != '') {
        socket.emit('rooms-create', name);
        if (roomNameInput.hasClass('empty')) roomNameInput.removeClass('empty');
        roomNameInput.value = '';
    } else {
        roomNameInput.focus();
        if (!roomNameInput.hasClass('empty')) roomNameInput.addClass('empty');
    }
});

socket.emit('rooms-get');
socket.on('rooms-update', function (rooms) {
    //TODO Do not remove all but check if room doesn't exist to add
    roomsContainer.removeChildren();
    rooms.forEach(function (room) {
        addRoom(room.name, room.playerCount);
    });

    var roomsCount = document.getElementById('rooms-count');
    if (rooms.length == 0) {
        roomsCount.innerHTML = "Pas de salle disponible.";
    } else if (rooms.length == 1) {
        roomsCount.innerHTML = rooms.length + " salle disponible";
    } else {
        roomsCount.innerHTML = rooms.length + " salles disponibles";
    }
});
socket.on('already-in-room', function (rooms) {
    alert('Vous êtes déjà dans la room.');
});
window.addEventListener('hashchange', function (e) {
    e.preventDefault();
});