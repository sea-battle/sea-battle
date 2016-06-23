var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var Game = new Schema({
    score: {
        type: Number,
        default: 34
    },
    date: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Game', Game);