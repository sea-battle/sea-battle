var Account = require('../models/user');
var express = require('express');
var passport = require('passport');
var router = express.Router();

router.get('/signin', function (req, res) {
    console.log('toto');
});

// router.get('/', function (req, res) {
//     res.redirect('/login');
// });
//
// router.get('/signup', function (req, res) {
//     res.render('signup', {});
// });
//
// router.post('/signup', function (req, res) {
//     Account.register(new Account({
//         username: req.body.username,
//         password: req.body.password,
//         email: req.body.email
//     }),
//     req.body.password, function (err, account) {
//         if (err) {
//             return res.render('register', {
//                 account: account
//             });
//         }
//
//         passport.authenticate('local')(req, res, function () {
//             res.redirect('/admin');
//         });
//     });
// });
//
// router.get('/login', function (req, res) {
//     res.render(
//         'login',
//         {
//             user: req.user
//         }
//     );
// });
//
// router.post('/login', passport.authenticate(
//     'local',
//     {
//         successRedirect: '/admin',
//         failureRedirect: '/login'
//     }
// ));
//
// router.get('/logout', function (req, res) {
//     req.logout();
//     res.redirect('/login');
// });
//
module.exports = router;