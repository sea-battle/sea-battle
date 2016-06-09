var socket = io();

document.getElementById('set-ready').addEventListener('click', function (e) {
    socket.emit('setReady');
    document.getElementById('ready-status').innerHTML = "Ready";
});