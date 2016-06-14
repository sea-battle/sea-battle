var sendButton = document.getElementById('send-message');
var playerMessage = document.getElementById('player-message');
var messagesContainer = document.getElementById('messages');

function sendMessage() {
    var message = playerMessage.value;
    if (message != "") {
        socket.emit('chat-player-message', message);
        playerMessage.value = '';
    }
}

sendButton.addEventListener('click', function (e) {
    sendMessage();
});
window.addEventListener('keyup', function (e) {
    if (e.keyCode == "13") { // ENTER
        sendMessage();
    }
});

socket.emit('chat-is-writing');

socket.on('receive-message', function (playerName, message) {
    console.log(playerName, message);
    var p = document.createElement('p');
    p.innerHTML = playerName + ' : ' + message;
    messagesContainer.appendChild(p);
});