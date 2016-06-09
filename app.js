var app = require('express')(),
    express = require('express'),
    server = require('http').createServer(app),
    io = require('socket.io').listen(server);

var game = require('./game');
var routeAuthentication = require('./routes/authentication');

app.use(express.static(__dirname + '/public'));
app.set('view engine', 'jade');

app.use('/', routeAuthentication);

app.get('/', function (req, res) {
    //game.roomToJoin = '/tamere';
    res.render(__dirname + '/views/index');
});
app.get('/rooms', function (req, res) {
    res.render(__dirname + '/views/rooms');
});
app.get('/wait', function (req, res) {
    res.render(__dirname + '/views/wait');
});
app.get('/game', function (req, res) {
    res.render(__dirname + '/views/game');
});
app.get('*', function (req, res) {
    res.render(__dirname + '/views/404');
});

io.of(game.roomToJoin).on('connection', function (socket) {
    //socket.on('init', function (data) {});
    if (game.players.length < game.ROOM_MAX_PLAYER) {
        socket.player = {
            ready: false
        };
        game.players.push(socket);

        socket.on('setReady', function () {
            if (!socket.player.ready) {
                socket.player.ready = true;
                if (game.getPlayerReadyCount() == game.players.length &&
                    game.players.length > 1) {
                    io.sockets.emit('startGame', socket.player);
                }
            }
        });
    }

    socket.on('disconnect', function () {
        var i = game.players.indexOf(socket);
        game.players.splice(i, 1);
    });

    console.log(game.roomToJoin + ' => ' + 'game.players.length:', game.players.length);
});

server.listen(3000);