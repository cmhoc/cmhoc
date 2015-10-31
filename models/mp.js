var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var MemberSchema = new Schema({
    "username": {type: String, default: ''},
    "type": {type: String, default: ''},
    "position": {
        type: String,
        default: ''
    },
    "party": {
        type: String,
        default: ''
    },
    "riding": {
        type: String,
        default: ''
    },
    "rdcode": {
        type: String,
        default: ''
    },
    "elecdist": {
        type: String,
        default: ''
    },
    "edcode": {
        type: String,
        default: ''
    }
}, {collection: 'members'});

module.exports = mongoose.model('Member', MemberSchema);