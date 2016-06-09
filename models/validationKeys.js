var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var ValidationKeys = new Schema({
    keys: [{
        dateCreation: Date,
        _id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        }
    }]
});

module.exports = mongoose.model('ValidationKeys', ValidationKeys);