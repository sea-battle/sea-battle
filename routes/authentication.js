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
    resave: true,
    saveUninitialized: true,
    secret: 'sea-battle-is-the-shit',
}));

// In a Connect or Express-based application, passport.initialize() middleware is required to initialize Passport.
router.use(passport.initialize());

router.use(passport.session());

// Routes: method POST
router.post('/check-username-availability', function (req, res) {
    User.findOne({
        username: req.body.username
    }, function (err, user) {
        if (user) {
            return res.json({
                success: false,
                message: 'Ce pseudonyme est déjà utlisé'
            });
        } else {
            return res.json({
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
                return res.status(403).send({
                    success: false,
                    message: 'Une erreur est survenue lors de l\'inscription'
                });
            }

            passport.authenticate('local')(req, res, function () {
                return res.status(200).send({
                    success: true,
                    message: 'Un e-mail de confirmation vous a été envoyé'
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
                success: false,
                message: 'Le pseudonyme ou le mot de passe est incorrect'
            });
        }

        req.login(user, function (err) {
            if (err) {
                return next(err);
            }

            // Initialize session
            req.session.user = user;

            return res.status(200).send({
                success: true
            });
        });
    })(req, res, next);
});

router.post('/edit-email', function(req, res) {
    User.update({
        email: req.session.user.email
    }, {
        email: req.body.email
    }, function(err, response) {
        if (err) {
            return res.status(500).send({
                success: false,
                message: 'L\'adresse e-mail n\'a pas pu être changé'
            });
        }

        // Persist session after updating user data
        req.logIn(req.session.user, function (err) {
        })

        return res.status(200).send({
            success: true,
            message: 'L\'adresse e-mail a été changé avec succès'
        });
    });
});

router.post('/edit-username', function(req, res) {
    User.update({
        username: req.session.user.username
    }, {
        username: req.body.username
    }, function(err, response) {
        if (err) {
            return res.status(500).send({
                success: false,
                message: 'Le pseudonyme n\'a pas pu être changé'
            });
        }

        // Persist session after updating user data
        req.logIn(req.session.user, function (err) {
        })

        return res.status(200).send({
            success: true,
            message: 'Le pseudonyme a été changé avec succès'
        });
    });
});

router.post('/delete-user', function (req, res, next) {
    User.remove({ username: req.session.user.username }, function (err, response) {
        if (err) {
            return next(err);
        }

        // Destroy session
        req.session = null;

        // Redirect in case JavaScript is disabled
        res.redirect('/');
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
    req.logout();
    req.session = null;
    res.redirect('/');
});

module.exports = router;