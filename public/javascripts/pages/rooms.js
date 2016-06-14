var socket = io();
var roomName = document.getElementById('room-name');
var createRoomButton = document.getElementById('create-room');
var roomsContainer = document.getElementById('rooms');

function joinHandler(e){
    socket.emit('rooms-join', this.getAttribute('data-room'));
}

function addRoom(roomName) {
    var newLi = document.createElement('li');
    newLi.setAttribute('data-room-name', roomName);
    var p = document.createElement('p');
    var buttonJoin = document.createElement('button');
    var leftDiv = document.createElement('div');
    var rightDiv = document.createElement('div');

    p.innerHTML = roomName;
    buttonJoin.innerHTML = 'Rejoindre';
    buttonJoin.setAttribute('data-room', roomName);
    buttonJoin.addEventListener('click', joinHandler);
    leftDiv.appendChild(p);
    rightDiv.appendChild(buttonJoin);

    newLi.appendChild(leftDiv);
    newLi.appendChild(rightDiv);

    rooms.appendChild(newLi);
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
        addRoom(room);
    });
});