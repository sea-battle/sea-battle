var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var Game = new Schema({
    score: Number,
    date: Date
});

module.exports = mongoose.model('Game', Game);