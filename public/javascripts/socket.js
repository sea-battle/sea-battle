var socket = io();

document.getElementById('set-ready').addEventListener('click', function (e) {
    socket.emit('setReady');
    document.getElementById('ready-status').innerHTML = "Ready";
});

socket.on('connect', function () {
    socket.emit('init', {
        test : "test"
    });
});


socket.on('startGame', function (player) {
    console.log(player);
    //window.location.href = '/game';
});