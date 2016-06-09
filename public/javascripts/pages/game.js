var socket = io();

socket.on('connect', function () {
    socket.emit('init', {
        test: "test"
    });
});


socket.on('startGame', function (player) {
    console.log(player);
    //window.location.href = '/game';
});