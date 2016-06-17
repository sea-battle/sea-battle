const cookieParser = require('cookie-parser');
const crypto = require('crypto');
const express = require('express');
const nodemailer = require('nodemailer');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const session = require('express-session');

const router = express.Router();

// Load the models
const User = require('../models/user');
const EmailVerificationToken = require('../models/emailVerificationToken');

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

// SMTP (Simple Mail Transfer Protocol) Settings
const smtpConfig = {
    host: 'smtps.upmc.fr',
    port: 587,
    secure: false,
    auth: {
        user: '2965253',
        pass: 'UPMC--louis--25091990'
    }
};

// Create reusable transporter object
var transporter = nodemailer.createTransport(smtpConfig);

// Define the e-mail sending function
function sendVerificationEmail(options) {
    transporter.sendMail(options, function(err, info){
        if (err){
            return console.log(err);
        }
    });
}

// Handle e-mail verification tokens
function generateToken(userId) {
    var emailVerificationToken = new EmailVerificationToken({
        key: crypto.randomBytes(16).toString('hex'),
        userId: userId
    });

    emailVerificationToken.save(function (err) {
        if (err) {
            // Handle error
        }
    });

    return emailVerificationToken._id
}

// Format the verification e-mail
function formatVerificationEmail(tokenId) {
    return '<table width="100%" border="0" cellspacing="0" cellpadding="0">' +
        '<tr>' +
            '<td align="center">' +
                '<div>' +
                    '<img src="https://avatars0.githubusercontent.com/u/19774670?v=3&s=200">' +
                    '<p>Confirmez votre inscription en cliquant sur le lien ci-dessous.</p>' +
                    '<p><a href="localhost:3000/verify/' + tokenId + '" title="">Confirmez votre inscription</a></p>' +
                '</div>' +
            '</td>' +
        '</tr>' +
    '</table>';
}

// Routes middlewares: make sure the user is authenticated
var isAuthenticated = function (req, res, next) {
    if (req.isAuthenticated()) {
        next();
    } else {
        if (req.xhr) {
            res.status(401).send();
        } else {
            res.redirect('/');
        }
    }
}

// Route middleware: make sure the user is not authenticated
isNotAuthenticated = function (req, res, next) {
    if (req.isAuthenticated()) {
        res.redirect('/rooms');
    } else {
        return next();
    }
}

// Routes: method POST
router.post('/check-username-availability', function (req, res) {
    User.findOne({ username: req.body.username }, function (err, user) {
        if (user) {
            res.status(409).send();
        } else {
            res.status(200).send();
        }
    });
});

router.post('/signup', function (req, res) {
    var _checkEmailAddress = function(email) {
        var regexEmail = /^([A-Za-z0-9_\-\.])+\@([A-Za-z0-9_\-\.])+\.([A-Za-z]{2,4})$/;

        return (regexEmail.test(email)) ? true : false;
    };

    var _checkPassword = function(password, passwordConfirmation) {
        return (password === passwordConfirmation) ? true : false;
    }

    User.findOne({
        $or: [
            { username: req.body.username },
            { email: req.body.email }
        ]
    }, function (err, user) {
        if (err) {
            // Handle error
        }

        if (user || !_checkEmailAddress(req.body.email) || !_checkPassword(req.body.password, req.body.passwordConfirmation)) {
            res.status(400);
            res.render(__dirname + '/../views/signup', {
                success: false
            });
        } else {
            User.register(new User({
                    username: req.body.username,
                    email: req.body.email,
                    validated: false
                }), req.body.password, function (err, user) {
                    if (err) {
                        res.status().send();
                    }

                    // Generate a token and store its identifier
                    var tokenId = generateToken(user._id);

                    // Send the verification e-mail
                    sendVerificationEmail({
                    	from: '"Sea Battle" <louis.fischer@etu.upmc.fr>',
                        // to: user.email,
                    	to: 'louis.fischer@free.fr',
                    	subject: 'Sea Battle - confirmation de votre inscription',
                    	html: formatVerificationEmail(tokenId)
                    });

                    res.status(201);

                    if (req.xhr) {
                        res.send();
                    } else {
                        res.render(__dirname + '/../views/signup', {
                            success: true
                        });
                    }
                }
            );
        }
    });
});

router.post('/signin', passport.authenticate('local'), function (req, res) {
    if (req.user.validated) {
        res.send(req.user)
    } else {
        req.session.destroy(function (err) {
        })

        res.status(401).send();
    }
});

router.post('/edit-email', isAuthenticated, function (req, res) {
    User.update({ _id: req.user._id }, { email: req.body.email }, function (err, response) {
        if (err) {
            res.status(500).send();
        }

        res.status(200).send();
    });
});

router.post('/edit-username', isAuthenticated, function (req, res) {
    User.update({ _id: req.user._id }, { username: req.body.username }, function (err, response) {
        if (err) {
            res.status(500).json();
        }

        res.status(200).send();
    });
});

router.post('/edit-password', isAuthenticated, function (req, res, next) {
    // Find a user with an identifier matching the one stored in the session
    User.findById(req.user._id, function (err, user) {
        if (err) {
            next(err);
        }
        // Test authentication with found user and password from form
        user.authenticate(req.body.oldPassword, function (err, user, passwordErr) {
            if (err) {
                res.status(500).send();
            } else if (passwordErr) {
                res.status(403).send();
            } else {
                // Replace current password with new password
                user.setPassword(req.body.password, function () {
                    user.save();
                    res.status(200).send();
                });
            }
        });
    });
});

router.post('/delete-user', isAuthenticated, function (req, res, next) {
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

// Routes: method GET
router.get('/verify/:tokenId', isNotAuthenticated, function (req, res) {
    var _verifyFailed = function (userId = false) {
        if (userId) {
            // Remove the user from the database if the verification failed
            User.remove({ _id: userId }, function (err, response) {
                if (err) {
                    // Handle error
                }
            });
        }

        res.render(__dirname + '/../views/verify', {
            success: false
        });
    };

    // Find a token matching the token identifier passed in parameter in the URL
    EmailVerificationToken.findById(req.params.tokenId, function (err, token) {
        if (err) {
            _verifyFailed();
        }

        if (token) {
            // Find a user matching the user identifier from the token and set "validated" to true
            User.findOneAndUpdate({ _id: token.userId }, { validated: true }, function (err, user) {
                if (err) {
                    _verifyFailed(user._id);
                }

                if (user) {
                    // Remove the token
                    EmailVerificationToken.remove({ _id: token._id }, function (err, response) {
                        if (err) {
                            // Handle error
                        }
                    });

                    res.render(__dirname + '/../views/verify', {
                        success: true
                    });
                }
            });
        }
    });
});

router.get('/', function (req, res) {
    res.locals.username = (req.user) ? req.user.username : false;
	res.render(__dirname + '/../views/index');
});

app.get('/signup', isNotAuthenticated, function (req, res) {
	res.render(__dirname + '/views/signup', {
		bodyClass: 'signup',
        success: null
	});
});

app.get('/profile', function (req, res) {
	res.render(__dirname + '/views/profile', {
		bodyClass: 'profile'
	});
});

router.get('/signout', function (req, res) {
    req.session.destroy(function (err) {
        res.redirect('/');
    })
});

module.exports = router;