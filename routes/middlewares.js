var checkCredentials = function (req, res, next) {
    var _checkEmailAddress = function(email) {
        var regexEmail = /^([A-Za-z0-9_\-\.])+\@([A-Za-z0-9_\-\.])+\.([A-Za-z]{2,4})$/;

        return (regexEmail.test(email)) ? true : false;
    };

    var _checkPassword = function(password, passwordConfirmation) {
        return (password === passwordConfirmation) ? true : false;
    };

    User.findOne({
        $or: [
            { username: req.body.username },
            { email: req.body.email }
        ]
    }, function (err, user) {
        if (err) {
            // Handle error
        }

        if (user) {
            res.status(409);
            res.render(__dirname + '/../views/signup', {
                error: 'user_exists'
            });
        } else if (!_checkEmailAddress(req.body.email) || !_checkPassword(req.body.password, req.body.passwordConfirmation)) {
            res.status(400);
            res.render(__dirname + '/../views/signup', {
                error: 'bad_format'
            });
        } else {
            next();
        }
    });
};

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
module.exports.isAuthenticated = isAuthenticated;

// Route middleware: make sure the user is not authenticated
var isNotAuthenticated = function (req, res, next) {
    if (req.isAuthenticated()) {
        res.redirect('/rooms');
    } else {
        return next();
    }
}
module.exports.isNotAuthenticated = isNotAuthenticated;