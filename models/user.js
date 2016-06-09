var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var passportLocalMongoose = require('passport-local-mongoose');
var Skin = require('./skin').Schema;

var User = new Schema({
    username: String,
    password: String,
    email: String,
    skins: Skin,
    validated : Boolean,
    ip: String
});

User.plugin(passportLocalMongoose);

module.exports = mongoose.model('User', User);