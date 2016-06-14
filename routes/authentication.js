var cookieParser = require('cookie-parser');
var express = require('express');
var passport = require('passport'),
    LocalStrategy = require('passport-local').Strategy;
var session = require('express-session');

var User = require('../models/user');

var router = express.Router();

// Read cookies
router.use(cookieParser());

// Passport configuration
passport.serializeUser(function (user, done) {
    done(null, user.id);
});

passport.deserializeUser(function (id, done) {
    User.findById(id, function (err, user) {
        done(err, user);
    });
});

passport.use(new LocalStrategy(User.authenticate()));

// Sessions settings
router.use(session({
    cookie: {
        maxAge: 1000 * 3600
    },
    resave: false,
    saveUninitialized: true,
    secret: 'sea-battle-is-the-shit',
}));

// In a Connect or Express-based application, passport.initialize() middleware is required to initialize Passport.
router.use(passport.initialize());

router.use(passport.session());

// Routes: method POST
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
        }),
        req.body.password, function (err, user) {
            if (err) {
                return res.status(403).send({
                    signupSucceed: false,
                    signupMessage: 'Une erreur est survenue lors de l\'inscription'
                });
            }

            passport.authenticate('local', {
                failureFlash: true
            })(req, res, function () {
                return res.status(200).send({
                    signupSucceed: true,
                    signupMessage: 'Un e-mail de confirmation vous a été envoyé'
                });
            });
        }
    );
});

router.post('/signin', function (req, res, next) {
    passport.authenticate('local', function (err, user, info) {
        if (err) {
            return next(err);
        }

        if (!user) {
            return res.status(401).send({
                signinSuccess: false,
                signinMessage: 'Le pseudonyme ou le mot de passe est incorrect'
            });
        }

        req.login(user, function (err) {
            if (err) {
                return next(err);
            }
            return res.status(200).send({
                signinSuccess: true,
                signinMessage: 'Vous êtes maintenant connecté en tant que ' + user.username
            });
        });
    })(req, res, next);
});

// Route middleware: make sure the user is authenticated
function isAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
        res.redirect('/YOLO');
    }
    else {
        return next();
    }
}

// Routes: method GET
router.get('/signup', isAuthenticated, function (req, res) {
    res.render(__dirname + '/../views/signup');
});

router.get('/manage-account', function (req, res) {
    res.render(__dirname + '/../views/manage-account');
});

router.get('/signout', function (req, res) {
    req.logout();
    res.redirect('/');
});

module.exports = router;