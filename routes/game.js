var express = require('express');
var jade = require('jade');
var User = require('../models/user');
var Game = require('../models/game');

var router = express.Router();

// Load routes middlewares
var routesMiddlewares = require('./middlewares');

router.post('/update-player', function (req, res) {
    var data = JSON.parse(req.body.data);
    console.log(data);
    /*
    var finisehdGame = new Game({
        score: data.gamePoints,
        date: Date.now()
    });
    
    var currentsGame = data.games;
    if (currentsGame == ''){
        currentsGame = [];
    }else{
        currentsGame = JSON.parse(currentsGame);
    }
    currentsGame.push(finisehdGame);
    */
    User.findByIdAndUpdate(data._id, {
            pointsCount: data.globalPoints + data.gamePoints,
            //games: currentsGame
        },
        function (err, user) {
            if (err) {
                throw err;
            }
            res.json({
                success: true
            });
        });
});

router.get('/test', function (req, res) {
    res.render(__dirname + '/../views/test', {
        bodyClass: 'test'
    });
});


router.use(function (req, res, next) {
    if (req.user) {
        next();
    } else {
        res.redirect('/');
    }
});


router.get('/rooms', function (req, res) {
    res.render(__dirname + '/../views/rooms', {
        bodyClass: 'rooms',
        user: (req.user) ? {
            username: req.user.username,
            rank: req.user.rank,
            rankIcon: req.user.rankIcon,
            pointsCount: req.user.pointsCount
        } : false,
    });
});

router.get('/wait', function (req, res) {
    var fn = jade.compileFile(__dirname + '/../views/wait.jade');
    var html = fn({
        user: (req.user) ? {
            username: req.user.username,
            rank: req.user.rank,
            rankIcon: req.user.rankIcon,
            pointsCount: req.user.pointsCount
        } : false
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

router.get('/game', function (req, res) {
    var fn = jade.compileFile(__dirname + '/../views/game.jade');
    var html = fn({
        user: (req.user) ? {
            username: req.user.username,
            rank: req.user.rank,
            rankIcon: req.user.rankIcon,
            pointsCount: req.user.pointsCount
        } : false
    });
    return res.json({
        bodyClass: 'game',
        html: html,
        scriptsSrc: [
            '/javascripts/boat.js',
            '/javascripts/pages/game.js',
            '/javascripts/chat.js'
        ],
        title: 'Let\'s shoot',
        user: (req.user) ? {
            username: req.user.username,
            rank: req.user.rank,
            rankIcon: req.user.rankIcon,
            pointsCount: req.user.pointsCount
        } : false
    });
});

module.exports = router;