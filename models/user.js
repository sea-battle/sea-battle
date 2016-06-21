var mongoose = require('mongoose');
var Schema = mongoose.Schema;

passportLocalMongoose = require('passport-local-mongoose');
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
    rank: {
        type: String,
        default: 'Matelot'
    },
    rankIcon: {
        type: String,
        default: '/images/test1.jpg'
    },
    pointsCount: {
        type: Number,
        default: 0
    },
    skins: Skin,
    ip: String,
    games: [Game]
});

User.plugin(passportLocalMongoose, {
    usernameField: 'email'
});

module.exports = mongoose.model('User', User);