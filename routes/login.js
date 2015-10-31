var express = require('express');
var Member = require('../models/mp');
var numeral = require('numeral');
var _ = require('lodash');
var config = require('config');
var db = config.get('db');
var rawjs = require('raw.js');
var reddit = new rawjs("web:cmhoc.xyl.pw:15.10 (by /u/zhantongz)");

var router = express.Router();

/* GET home page. */
router.get('/', function (req, res, next) {
    var referer = req.header('Referer');
    var returnurl = '';

    if(_.includes(referer, req.protocol + '://' + req.header('Host'))) {
        returnurl = encodeURIComponent(referer);
    }

    if(typeof req.query.returnurl != "undefined") {
        returnurl = req.query.returnurl;
    }

    if(returnurl === '') {
        returnurl = '/';
    }

    res.render('login', {
        title: "Log in",
        oautherr: req.query.oautherr,
        returnurl: returnurl
    });
});

router.get('/out', function (req, res, next) {
    reddit.logout();
    req.session.destroy();
    res.redirect('/');
});


module.exports = router;
