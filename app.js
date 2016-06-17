// Modules requirements
var app = require('express')(),
	bodyParser = require('body-parser'),
	express = require('express'),
	jade = require('jade'), // TOREMOVE when two routes will be removed
	mongoose = require('mongoose'),
	morgan = require('morgan'),
	server = require('http').createServer(app),
	io = require('socket.io').listen(server);

// Local requirements
var config = require('./config'),
	game = require('./game'),
	socket = require('./socket');

// Routes requirements
var routesMain = require('./routes/main'),
	routesAuthentication = require('./routes/authentication'),
	routesGame = require('./routes/game');

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

// TOREMOVE both
app.get('/profile', function (req, res) {
	res.render(__dirname + '/views/profile', {
		bodyClass: 'profile'
	});
});
app.get('/signup', function (req, res) {
	res.render(__dirname + '/views/signup', {
		bodyClass: 'signup'
	});
});

app.use('/', routesAuthentication);
app.use('/', routesGame);
app.use('/', routesMain);



mongoose.connect(config.database.location, config.database.options);
socket.start(io, game);

server.listen(3000, '0.0.0.0');