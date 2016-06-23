var express = require('express');
var jade = require('jade');
var User = require('../models/user');
var Game = require('../models/game');

var router = express.Router();

// Load the models
const User = require('../models/user');

// Load routes middlewares
var routesMiddlewares = require('./middlewares');

router.get('/blabla', function (req, res) {
    res.json({
        blabla: 'blabla'
    });
});

router.get('/user', function (req, res) {
    User.findById();
});

router.post('/update-player', function (req, res) {
    var data = JSON.parse(req.body.data);
    console.log(data);
    /*
    var finisehdGame = new Game({
        score: data.gamePoints,
        date: Date.now()
    });

    var currentsGame = data.games;
    if (currentsGame == '') {
        currentsGame = [];
    } else {
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
        users: new Array()
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
            '/javascripts/chat.js',
            '/javascripts/ranking.js'
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
            '/javascripts/chat.js',
            '/javascripts/ranking.js'
        ],
        title: 'Let\'s shoot',
        user: (req.user) ? {
            username: req.user.username,
            rank: req.user.rank,
            rankIcon: req.user.rankIcon,
            pointsCount: req.user.pointsCount
        } : false,
        users: null
    });
});

router.get('/general-ranking', function (req, res) {
    User.find().sort('pointsCount').exec(function (err, users) {
        if (err) {
            // Handle error
        }

        var fn = jade.compileFile(__dirname + '/../views/inc/ranking.jade');
        var html = fn({
            user: (req.user) ? req.user : false,
            users: users
        });
        res.json({
            html: html
        });
    });
});

router.get('/month-ranking', function (req, res) {
    var monthRanking = new Array();

    User.find({}, function (err, users) {
        users.forEach(function (user, i, userArray) {
            monthRanking.push({
                username: user.username,
                rank: user.rank,
                pointsCount: 0,
            });

            var userGames = user.games;

            var userPointsCount = 0;
            userGames.forEach(function (userGame, j, userGamesArray) {
                var dateMin = new Date();
                dateMin.setMonth(dateMin.getMonth() - 1);

                var userGameDate = new Date(userGame.date);

                if (userGameDate >= dateMin) {
                    userPointsCount += userGame.score;
                }
            });

            monthRanking[i].pointsCount = userPointsCount;
        });

        // Sort monthRanking in descending order
        monthRanking.sort(function (m, n) {
            return n.pointsCount - m.pointsCount;
        });

        var fn = jade.compileFile(__dirname + '/../views/inc/ranking.jade');
        var html = fn({
            user: (req.user) ? req.user : false,
            users: monthRanking
        });
        res.json({
            html: html
        });
    });
});

module.exports = router;