var app = require('express')(),
    bodyParser = require('body-parser'),
    express = require('express'),
    mongoose = require('mongoose'),
    morgan = require('morgan'),
    server = require('http').createServer(app),
    passport = require('passport'),
    io = require('socket.io').listen(server),
    expressSession = require('express-session');

var config = require('./config'),
    game = require('./game'),
    socket = require('./socket');

app.use(function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});

// Log everything to the console
//app.use(morgan('dev'));

// Get informations from HTML forms. Needs to be loaded before routesAuthentication
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: true
}));

var sessionMiddleware = expressSession({
    secret: 'Blabla',
    resave: false,
    saveUninitialized: false
});

app.use(sessionMiddleware);
app.use(passport.initialize());
app.use(passport.session());

io.use(function (socket, next) {
    sessionMiddleware(socket.request, {}, next);
});

// Load stylesheets, JavaScript files, images and fonts
app.use(express.static(__dirname + '/public'));

// Load all routes required for authentication
var routesAuthentication = require('./routes/authentication');
app.use('/', routesAuthentication);

// Load all routes relative to the game
var routesGame = require('./routes/game');
app.use('/', routesGame);

// Load all other routes
routesMain = require('./routes/main');
app.use('/', routesMain);

// Set templating engine
app.set('view engine', 'jade');

mongoose.connect(config.database.location, config.database.options);
socket.start(io, game);

server.listen(3000, '0.0.0.0');