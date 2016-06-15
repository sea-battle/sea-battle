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

function getActiveChatTabFilter() {
    var tabs = document.getElementsByClassName('filters');
    var activeTabFilter;
    var found = false;
    var i = 0;
    while (i < tabs.length && !found) {
        if (tabs[i].getAttribute('data-active') == 'true') {
            activeTabFilter = tabs[i].id;
            found = true;
        }
    }

    return activeTabFilter;
};

sendButton.addEventListener('click', function (e) {
    sendMessage();
});

for (var i = 0; i < filters.length; i++) {
    filters[i].addEventListener('click', function (e) {
        for (var i = 0; i < filters.length; i++) {
            filters[i].setAttribute('data-active', 'false');
            filters[i].removeClass('active');
        }

        this.setAttribute('data-active', 'true');
        this.addClass('active');
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

socket.on('receive-message', function (playerName, message, time, filter) {
    var activeTabFilter = getActiveChatTabFilter();
    if (activeTabFilter == filter ||
        activeTabFilter == 'all-messages') {
        addMessage(playerName, message, time);
    } else {
        console.log('obj');
    }
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