var express = require('express');
var passport = require('passport');

var User = require('../models/user');

var router = express.Router();

LocalStrategy = require('passport-local').Strategy;

router.post('/signup', function (req, res) {
    User.register(new User({
        username: req.body.username,
        email: req.body.email,
        validated: false
    }), req.body.password, function (err, user) {
        if (err) {
            throw err;
        }

        passport.authenticate('local')(req, res, function () {
            console.log(res);

            res.json({
                signupSucceed : true,
                signupSucceedMessage : 'Un e-mail de confirmation vous a été envoyé'
            });
        });
    });
});

/*
passport.use('signup', new LocalStrategy({
    // Override username with email
    usernameField : 'email',
    passwordField : 'password',
    // Allow to pass back the entire request to the callback
    passReqToCallback : true
},
function (req, email, password, done) {
    // Asynchronous. User.findOne wont fire unless data is sent back
    process.nextTick(function () {
        // Find a user whose e-mail is the same as the e-mail that was sent by the form
        // Check if the user who is trying to login exists
        User.findOne({
            'local.email' : email
        },
        function (err, user) {
            // if there are any errors, return the error
            if (err)
                return done(err);

            // Check if there is already a user with that e-mail
            if (user) {
                return done(null, false, req.flash('signupMessage', 'Un utilisateur utilise déjà cette adresse e-mail'));
            } else {
                // If there is no user with that email, the user is created
                var newUser = new User();

                // Set the user's local credentials
                newUser.local.email = email;
                newUser.local.password = newUser.generateHash(password);

                // Save the user
                newUser.save(function (err) {
                    if (err) {
                        throw err;
                    }

                    return done(null, newUser);
                });
            }
        });
    });
}));
*/

module.exports = router;