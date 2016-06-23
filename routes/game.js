var express = require('express');
var jade = require('jade');

var router = express.Router();

// Load the models
const User = require('../models/user');

// Load routes middlewares
var routesMiddlewares = require('./middlewares');

router.get('/rooms', routesMiddlewares.isAuthenticated, function (req, res) {
    res.render(__dirname + '/../views/rooms', {
        bodyClass: 'rooms',
        user: (req.user) ? req.user : false,
        users: new Array()
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
            '/javascripts/chat.js',
            '/javascripts/ranking.js'
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
            '/javascripts/chat.js',
            '/javascripts/ranking.js'
        ],
        title: 'Let\'s shoot',
        user: (req.user) ? req.user : false
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

router.get('/test', function (req, res) {
    res.render(__dirname + '/../views/test', {
        bodyClass: 'test'
    });
});

module.exports = router;