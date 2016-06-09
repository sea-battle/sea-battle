var User = require('../models/user');
var express = require('express');
var passport = require('passport');
LocalStrategy = require('passport-local').Strategy;
var router = express.Router();

// passport.use('signup', new LocalStrategy({
//     // By default local strategy uses username and password, we will override with email
//     usernameField : 'email',
//     passwordField : 'password',
//     // Allows us to pass back the entire request to the callback
//     passReqToCallback : true
// },
// function (req, email, password, done) {
//     // Asynchronous. User.findOne wont fire unless data is sent back
//     process.nextTick(function () {
//         // Find a user whose e-mail is the same as the e-mail that was sent by the form
//         // Check if the user who is trying to login exists
//         User.findOne({
//             'local.email' : email
//         },
//         function (err, user) {
//             // if there are any errors, return the error
//             if (err)
//                 return done(err);
//
//             // Check if there is already a user with that e-mail
//             if (user) {
//                 return done(null, false, req.flash('signupMessage', 'Cet e-mail est déjà pris'));
//             } else {
//                 // If there is no user with that email, the user is created
//                 var newUser = new User();
//
//                 // Set the user's local credentials
//                 newUser.local.email = email;
//                 newUser.local.password = newUser.generateHash(password);
//
//                 // Save the user
//                 newUser.save(function (err) {
//                     if (err) {
//                         throw err;
//                     }
//
//                     return done(null, newUser);
//                 });
//             }
//         });
//     });
// }));

// router.post('/signup', function (req, res) {
//     User.register(new User({
//         username: req.body.username,
//     }),
//     req.body.password,
//     req.body.signup, function (err, user) {
//         if (err) {
//             throw err;
//         }
//
//         passport.authenticate('local')(req, res, function () {
//             console.log('Authentication succeeded');
//         });
//     });
// });

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
        });
    });
});


// router.post('/signup', function (req, res) {
//     User.register(new User({
//         username : req.body.signup-username
//     }),
//     req.body.signup-password, function (err, user) {
//         if (err) {
//             return res.render('register', {
//                 info: 'Sorry. That username already exists. Try again.'
//             });
//         }
//
//         passport.authenticate('local')(req, res, function () {
//             res.redirect('/');
//         });
//     });
// });
//
// router.post('/signup', function (req, res) {
//     User.register(new User({
//         username: req.body.username,
//         email: req.body.email,
//         password: req.body.password,
//         password: req.body.password-confirmation,
//     }),
//     req.body.password, function (err, user) {
//         if (err) {
//             throw new err;
//         }
//
//         passport.authenticate('local')(req, res, function (err) {
//             if (err) {
//                 res.json({
//                 })
//             }
//
//             res.json({
//                 signupSucceed : true,
//                 signupSucceedMessage : 'Un e-mail de confirmation vous a été envoyé'
//             });
//         });
//     });
// });

module.exports = router;