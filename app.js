var app = require('express')(),
	bodyParser = require('body-parser'),
	express = require('express'),
	mongoose = require('mongoose'),
	morgan = require('morgan'),
	server = require('http').createServer(app),
	io = require('socket.io').listen(server);

// Define local requirements
var config = require('./config'),
	game = require('./game'),
	socket = require('./socket');

// Load all routes and middlewares required for authentication
var	routesAuthentication = require('./routes/authentication');
app.use('/', routesAuthentication);

var	routesGame = require('./routes/game'),
    routesMain = require('./routes/main');

app.use('/', routesGame);
app.use('/', routesMain);

// Load stylesheets, JavaScript files, images and fonts
app.use(express.static(__dirname + '/public'));

// Log everything to the console
app.use(morgan('dev'));

// Get informations from HTML forms. Needs to be loaded before routesAuthentication
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
	extended: true
}));

// Set templating engine
app.set('view engine', 'jade');

mongoose.connect(config.database.location, config.database.options);
socket.start(io, game);

server.listen(3000);