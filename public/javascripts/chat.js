var sendButton = document.getElementById('send-message');
var playerMessage = document.getElementById('player-message');
var messagesContainer = document.getElementById('messages');
var filters = document.getElementsByClassName('filters');

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

for (var i = 0; i < filters.length; i++) {
    filters[i].addEventListener('click', function (e) {
        socket.emit('chat-filter', this.id);
    });
}

window.addEventListener('keyup', function (e) {
    if (e.keyCode == "13") { // ENTER
        sendMessage();
    }
});

socket.emit('chat-is-writing');

function addMessage(from, message, time) {
    var p = document.createElement('p');
    p.innerHTML = time + ' ' + from + ' => ' + message;
    messagesContainer.appendChild(p);
}

socket.on('receive-message', function (playerName, message, time) {
    addMessage(playerName, message, time);
});

socket.on('chat-filter', function (messages) {
    messagesContainer.removeChildren();
    messages.forEach(function (message) {
        var from = message.sender,
            mess = message.message,
            time = message.time;
            
        addMessage(from, mess, time);
    });
});