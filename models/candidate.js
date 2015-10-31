var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var CandidateSchema = new Schema({
    "username": {
        type: String,
        unique: true,
        required: true
    },
    "isleader":  {
        type: Boolean,
        default: false
    },
    "party": {
        type: String,
        default: 'IND'
    },
    "elecdist": {
        type: String,
        required: true
    },
    "election": {
        type: Date,
        required: true
    },
    "endorsed": {
        type: Boolean,
        default: false
    }
});

module.exports = mongoose.model('Candidate', CandidateSchema);