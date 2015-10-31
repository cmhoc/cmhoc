var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var ElectionSchema = new Schema({
    "title": {
        type: String,
        unique: true
    },
    "type": String,
    "votes": [
        {
            time: Date,
            elector: String,
            ip: String,
            vote: [{
                candidate: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: 'Candidate'
                },
                ranking: Number
            }],
            add_info: String
        }],
    "start": Date,
    "end": Date,
    "result": [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Member'
    }]
});

module.exports = mongoose.model('Election', ElectionSchema);