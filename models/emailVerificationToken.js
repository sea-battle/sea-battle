var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var EmailVerificationTokens = new Schema({
    createdAt: {
        type: Date,
        default: Date.now,
        expires: 3600 * 24 * 365
    },
    key: String,
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }
});

module.exports = mongoose.model('EmailVerificationTokens', EmailVerificationTokens);