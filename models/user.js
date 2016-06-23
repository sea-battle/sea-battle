var mongoose = require('mongoose');
var Schema = mongoose.Schema;

passportLocalMongoose = require('passport-local-mongoose');
var Skin = require('./skin').schema;
var Game = require('./game').schema;

var User = new Schema({
    email: {
        type: String,
        required: true,
    },
    games: [{
        score: {
            type: Number,
            default: 0
        },
        date: {
            type: Date,
            default: Date.now
        }
    }],
    ip: {
        type: String,
        default: '127.0.0.1'
    },
    pointsCount: {
        type: Number,
        default: 0
    },
    rank: {
        type: String,
        default: 'Matelot'
    },
    rankIcon: {
        type: String,
        default: '/images/test1.jpg'
    },
    username: {
        type: String,
        required: true,
    },
    skins: Skin,
    validated:  {
        type: Boolean,
        required: true,
        default: true
    }
});

User.plugin(passportLocalMongoose, {
    usernameField: 'email'
});

module.exports = mongoose.model('User', User);