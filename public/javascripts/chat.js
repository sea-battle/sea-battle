socket.emit('chat-is-writing');
socket.emit('chat-player-message');

socket.on('receive-message', function (playerName, message) {

});