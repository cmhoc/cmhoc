var express = require('express');
var mongoose = require('mongoose');
var Member = require('../models/mp');
var numeral = require('numeral');
var _ = require('lodash');
var config = require('config');
var db = config.get('db');

var router = express.Router();

/* GET home page. */
router.get('/', function (req, res, next) {
    var parl_number = 2;
    var types = ['government', 'cabinet', 'offopp', 'other', 'speaker'];

    mongoose.createConnection(db.uri, {user: db.user, pass: db.pass});
    mongoose.connection.on('error', console.log);

    Member.find().lean().exec(function (err, members) {
        if (err)
            console.log(err);

        members = _.groupBy(_.sortBy(members, 'party'), 'type');
        console.log(members);

        res.render('mps', {
            title: 'Members of Parliament',
            parl_number: parl_number,
            parl_number_o: numeral(parl_number).format('0o'),
            all_members: members
        });
    });
});

module.exports = router;
