var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var passportLocalMongoose = require('passport-local-mongoose');
var Skin = require('./skin').schema;
var Game = require('./game').schema;

var User = new Schema({
    username: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
    },
    validated:  {
        type: Boolean,
        required: true
    },
    skins: Skin,
    ip: String,
    games: [Game]
});

User.plugin(passportLocalMongoose);

module.exports = mongoose.model('User', User);