var config = require('config');
var redditapp = config.get('redditoauth');

var express = require('express');
var crypto = require("crypto");
var uuid = require('node-uuid');
var rawjs = require('raw.js');
var reddit = new rawjs("web:cmhoc.xyl.pw:15.10 (by /u/zhantongz)");

var router = express.Router();

router.get('/redirect', function (req, res, next) {
    if(!req.session.logged) {
        reddit.setupOAuth2(redditapp.clientID, redditapp.secret, redditapp.redirectURI);
        var randid = uuid.v4();
        var url = reddit.authUrl(randid, ['identity']);
        req.session.returnurl = (typeof req.query.returnurl == "undefined" ? '/' : req.query.returnurl);
        req.session.state = randid;
        console.log(req.session.returnurl);
        console.log(req.session.state);

        res.redirect(url);
    } else {
        res.render('login', {
            logged: req.session.logged,
            title: "Log in"
        });
    }
});

router.get('/', function (req, res, next) {
    var code = req.query.code;
    var state = req.query.state;
    var error = req.query.error;
    console.log(code + ' ' + state + ' ' + req.session.state + ' ' + error);    

    //if(state == req.session.state && (typeof req.query.error == "undefined")) {
    if((typeof req.query.error == "undefined")) {
        reddit.auth({"code": code}, function (err, response) {
            if (err) {
                console.log('Unable to authenticate user: ' + err);
                res.redirect('?oautherr=' + err);
            } else {
                req.session.logged = true;
                req.session.user = [];
                reddit.me(function (err, me) {
                    if(err) {
                        res.send(err);
                        return;
                    }
                    
                    console.log('login '+me);
                    req.session.user = me;
                    req.session.cookie.expires = new Date(Date.now() + 3500000);
                    res.redirect('/vote/5632fbda761ec3684d41a044/');
                });

                /*
                { name: 'zhantongz',
                 created: 1407106496,
                 hide_from_robots: true,
                 gold_creddits: 0,
                 created_utc: 1407102896,
                 link_karma: 764,
                 comment_karma: 1828,
                 over_18: true,
                 is_gold: false,
                 is_mod: true,
                 gold_expiration: null,
                 has_verified_email: true,
                 id: 'hpi8j',
                 inbox_count: 0 }*/
            }
        });
    } else if(typeof req.query.error != "undefined") {
        req.session.logged = false;
        req.session.destroy();
        res.redirect('/login?oautherr=' + error);
    } else {
        req.session.logged = false;
        req.session.destroy();
        console.log('unknown error occurred');
        res.redirect('/login?oautherr=unknown');
    }
});

module.exports = router;
