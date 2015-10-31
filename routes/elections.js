var express = require('express');
var mongoose = require('mongoose');
var _ = require('lodash');
var config = require('config');
var db = config.get('db');

var numeral = require('numeral');

var Election = require('../models/election');

var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
    mongoose.createConnection(db.uri, {user: db.user, pass: user.pass});
    mongoose.connection.on('error', console.log);

    Election.find().lean().exec(function (err, elections) {
        if (err)
            console.log(err);

        res.render('elections', {
            title: 'Elections to the House of Commons',
            elections: elections
        });
    });
});

module.exports = router;
