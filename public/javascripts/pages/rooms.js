var socket = io();
var roomName = document.getElementById('room-name');
var createRoomButton = document.getElementById('create-room');
var roomsContainer = document.getElementById('rooms');

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

socket.on('rooms-join', function () {
    ajax.get('/wait', handlers);
});


createRoomButton.addEventListener('click', function (e) {
    var name = roomName.value;
    if (name != '') {
        socket.emit('rooms-create', name);
        roomName.value = '';
    } else {
        roomName.focus();
        //TODO
        //roomName.addClass = voir class avec clement
    }
});

socket.emit('rooms-get');
socket.on('rooms-update', function (rooms) {
    //TODO Do not remove all but check if room doesn't exist to add
    roomsContainer.removeChildren();
    rooms.forEach(function (room) {
        addRoom(room.name, room.playerCount);
    });
});

window.addEventListener('hashchange', function (e) {
    e.preventDefault();
});