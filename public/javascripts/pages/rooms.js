var socket = io();
var roomName = document.getElementById('room-name');
var createRoomButton = document.getElementById('create-room');
var roomsContainer = document.getElementById('rooms');

function addRoom(roomName) {
    var newLi = document.createElement('li');
    newLi.setAttribute('data-room-name', roomName);
    var p = document.createElement('p');
    var buttonJoin = document.createElement('button');
    var leftDiv = document.createElement('div');
    var rightDiv = document.createElement('div');

    p.innerHTML = roomName;
    buttonJoin.innerHTML = 'Rejoindre';
    leftDiv.appendChild(p);
    rightDiv.appendChild(buttonJoin);

    newLi.appendChild(leftDiv);
    newLi.appendChild(rightDiv);

    rooms.appendChild(newLi);
}

socket.on('joinRoom', function (name) {
    window.location.href = '/wait';
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

socket.emit('getRooms');
socket.on('updateRooms', function (rooms) {
    //TODO Do not remove all but check if room doesn't exist to add
    roomsContainer.removeChildren();
    rooms.forEach(function (room) {
        addRoom(room);
    });
});