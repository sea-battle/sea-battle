var sendButton = document.getElementById('send-message');
var playerMessage = document.getElementById('player-message');
var messagesContainer = document.getElementById('messages');
var filters = document.getElementsByClassName('filters');
var newMessagesCount = document.getElementById('new-messages-count');
var playersTab = document.getElementById('players-messages');

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
        i++;
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
        if (this.id == 'all-messages' ||
            this.id == 'players-messages') {
            newMessagesCount.setAttribute('data-count', '0');
            newMessagesCount.innerHTML = '';
            if(playersTab.hasClass('new-messages')) playersTab.removeClass('new-messages');
        }

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
    var div = document.createElement('div');
    var pTime = document.createElement('p');
    var pFrom = document.createElement('p');
    var pMessage = document.createElement('p');

    div.className = 'message-wrapper';
    pTime.className = 'message-time';
    pFrom.className = 'message-from';
    pMessage.className = 'message-content';

    pTime.innerHTML = time;
    pFrom.innerHTML = from;
    pMessage.innerHTML = message;

    div.appendChild(pTime);
    div.appendChild(pFrom);
    div.appendChild(pMessage);
    messagesContainer.appendChild(div);
}

socket.on('receive-message', function (playerName, message, time, filter) {
    var activeTabFilter = getActiveChatTabFilter();
    if (activeTabFilter == filter ||
        activeTabFilter == 'all-messages') {
        addMessage(playerName, message, time);
    } else {
        var count = parseInt(newMessagesCount.getAttribute('data-count'));
        count++;
        newMessagesCount.setAttribute('data-count', count);
        newMessagesCount.innerHTML = count;
        if(!playersTab.hasClass('new-messages')) playersTab.addClass('new-messages');
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