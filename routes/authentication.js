var cookieParser = require('cookie-parser');
var express = require('express');
var passport = require('passport'),
    LocalStrategy = require('passport-local').Strategy,
    passportLocalMongoose = require('passport-local-mongoose');
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

// Passport: set strategy
passport.use(new LocalStrategy(User.authenticate()));

// Sessions settings
router.use(session({
    cookie: {
        maxAge: 1000 * 3600
    },
    resave: true,
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
            res.json({
                success: false,
                message: 'Ce pseudonyme est déjà utlisé'
            });
        } else {
            res.json({
                success: true,
                message: 'Ce pseudonyme est disponible'
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
                res.status(403).json({
                    success: false,
                    message: 'Une erreur est survenue lors de l\'inscription'
                });
            }

            passport.authenticate('local')(req, res, function () {
                res.status(200).json({
                    success: true,
                    message: 'Un e-mail de confirmation vous a été envoyé'
                });
            });
        }
    );
});

router.post('/signin', passport.authenticate('local'), function (req, res) {
    res.send(req.user)
});

router.post('/edit-email', function (req, res) {
    User.update({ _id: req.user._id }, { email: req.body.email }, function (err, response) {
        if (err) {
            res.status(500).json({
                success: false,
                message: 'L\'adresse e-mail n\'a pas pu être changé'
            });
        }

        res.status(200).json({
            success: true,
            message: 'L\'adresse e-mail a été changé avec succès'
        });
    });
});

router.post('/edit-username', function (req, res) {
    User.update({ _id: req.user._id }, { username: req.body.username }, function (err, response) {
        if (err) {
            res.status(500).json({
                success: false,
                message: 'Le pseudonyme n\'a pas pu être changé'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Le pseudonyme a été changé avec succès'
        });
    });
});

router.post('/edit-password', function (req, res, next) {
    // Find a user with an identifier matching the one stored in the session
    User.findById(req.user._id, function (err, user) {
        if (err) {
            next(err);
        }
        // Test authentication with found user and password from form
        user.authenticate(req.body.oldPassword, function (err, user) {
            if (err) {
                res.status(401).json({
                    message: 'Le mot de passe actuel est erroné'
                });
            }

            // Replace current password with new password
            user.setPassword(req.body.password, function () {
                user.save();
                res.status(200).json({
                    message: 'Le mot de passe a été changé avec succès'
                });
            });
        });
    });
});

router.post('/delete-user', function (req, res, next) {
    User.remove({ _id: req.user._id }, function (err, response) {
        if (err) {
            return next(err);
        }

        // Destroy session and redirect to home page
        req.session.destroy(function (err) {
            res.redirect('/');
        })
    });
});

// Route middleware: make sure the user is authenticated
function isAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
        if (req.route.path === '/signup' || req.route.path === '/') {
            res.redirect('/rooms');
        } else {
            return next();
        }
    } else {
        if (req.route.path === '/profile') {
            res.redirect('/');
        } else {
            return next();
        }
    }
}

// Routes: method GET
router.get('/', isAuthenticated, function (req, res) {
	res.render(__dirname + '/../views/index');
});

router.get('/signup', isAuthenticated, function (req, res) {
    res.render(__dirname + '/../views/signup');
});

router.get('/profile', isAuthenticated, function (req, res) {
    res.render(__dirname + '/../views/profile');
});

router.get('/signout', function (req, res) {
    req.session.destroy(function (err) {
        res.redirect('/');
    })
});

module.exports = router;