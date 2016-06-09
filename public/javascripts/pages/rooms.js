var socket = io();
var roomName = document.getElementById('room-name');
var createRoomButton = document.getElementById('create-room');

createRoomButton.addEventListener('click', function (e) {
    var name = roomName.value;
    if (name != '') {
        socket.emit('createRoom', name);
    } else {
        roomName.focus();
    }
});

socket.emit('getRooms');
socket.on('updateRooms', function (rooms){
    
});