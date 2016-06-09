var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var Skin = new Schema({
    tp: [String],
    sm: [String],
    dt: [String],
    cr: [String],
    ca: [String]
});

module.exports = mongoose.model('Skin', Skin);