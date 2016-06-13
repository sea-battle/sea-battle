var express = require('express');
var passport = require('passport'),
    LocalStrategy = require('passport-local').Strategy;

var User = require('../models/user');

var router = express.Router();

passport.use(new LocalStrategy(User.authenticate()));

router.post('/check-username-availability', function (req, res) {
    User.findOne({ username: req.body.username }, function (err, user) {
        if (user) {
            return res.json({
                usernameAvailability: false,
                usernameAvailabilityMessage: 'Ce pseudonyme est déjà utlisé'
            });
        } else {
            return res.json({
                usernameAvailability: true,
                usernameAvailabilityMessage: 'Ce pseudonyme est disponible'
            });
        }
    });
});

router.post('/signup', function (req, res) {
    User.register(new User({
        username: req.body.username,
        email: req.body.email,
        validated: false
    }), req.body.password, function (err, user) {
        if (err) {
          return res.json(403, {
              signupSucceed : false,
              signupMessage : 'Une erreur est survenue lors de l\'inscription'
          });
        }

        passport.authenticate('local', { failureFlash: true })(req, res, function () {
            res.json(200, {
                signupSucceed : true,
                signupMessage : 'Un e-mail de confirmation vous a été envoyé'
            });
        });
    });
});

router.post('/signin', function(req, res, next) {
    passport.authenticate('local', function(err, user, info) {
        if (err) {
            return next(err);
        }

        if (!user) {
            return res.send(401, {
                signinSuccess: false,
                signinMessage: 'Le pseudonyme ou le mot de passe est incorrect'
            });
        }

        req.login(user, function(err) {
            if (err) {
                return next(err);
            }
            return res.send(200, {
                signinSuccess: true,
                signinMessage: 'Vous êtes maintenant connecté en tant que ' + user.username
            });
        });
    })(req, res, next);
});

router.get('/signout', function (req, res) {
    req.logout();
    res.redirect('/');
});

module.exports = router;