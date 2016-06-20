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