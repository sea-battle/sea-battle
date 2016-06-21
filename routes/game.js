var express = require('express');
var jade = require('jade');

var router = express.Router();

// Load routes middlewares
var routesMiddlewares = require('./middlewares');

router.get('/rooms', routesMiddlewares.isAuthenticated, function (req, res) {
    res.render(__dirname + '/../views/rooms', {
        bodyClass: 'rooms',
        user: (req.user) ? req.user : false,
    });
});

router.get('/wait', routesMiddlewares.isAuthenticated, function (req, res) {
    var fn = jade.compileFile(__dirname + '/../views/wait.jade');
    var html = fn({
        user: (req.user) ? req.user : false
    });
    return res.json({
        bodyClass: 'wait',
        html: html,
        scriptsSrc: [
            '/javascripts/pages/wait.js',
            '/javascripts/chat.js'
        ],
        title: 'Prepare to fight'
    });
});

router.get('/game', routesMiddlewares.isAuthenticated, function (req, res) {
    var fn = jade.compileFile(__dirname + '/../views/game.jade');
    var html = fn();
    return res.json({
        bodyClass: 'game',
        html: html,
        scriptsSrc: [
            '/javascripts/boat.js',
            '/javascripts/pages/game.js',
            '/javascripts/chat.js'
        ],
        title: 'Let\'s shoot',
        user: (req.user) ? req.user : false
    });
});

router.get('/test', function (req, res) {
    res.render(__dirname + '/../views/test', {
        bodyClass: 'test'
    });
});

module.exports = router;