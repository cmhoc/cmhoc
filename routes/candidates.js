var express = require('express');
var mongoose = require('mongoose');
var Candidate = require('../models/candidate');
var _ = require('lodash');
var config = require('config');
var db = config.get('db');
var leaders = config.get('leaders');

var router = express.Router();

mongoose.connect(db.uri, {user: db.user, pass: db.pass});
mongoose.connection.on('error', console.log);

function isEligible(created_utc) {
    return ((Math.floor(Date.now() / 1000) - created_utc) / 2592000) > 2.9999;
}

router.get('/', function (req, res, next) {
    mongoose.createConnection(db.uri, {user: db.user, pass: db.pass});
    mongoose.connection.on('error', console.log);

    Candidate.find().lean().exec(function (err, candidates) {
        if (err)
            console.log(err);

        candidates = _.sortByAll(candidates, ['elecdist', 'party']);
        console.log(candidates);

        var isCandidate = false;
        var isleader = false;

        if (req.session.logged) {
            console.log(_.find(candidates, {username: req.session.user.name}));
            isCandidate = (typeof _.find(candidates, {username: req.session.user.name}) != 'undefined');
            isleader = _.includes(leaders, req.session.user.name);
        }

        res.render('candidates', {
            title: 'Candidates',
            elec_title: 'Third General Election',
            candidates: candidates,
            isCandidate: isCandidate,
            isleader: isleader
        });
    });
});

router.get('/register', function (req, res, next) {
    res.status(403).render('error', {
        error: {status: '403', 'stack': 'Deadline for registration has passed.'},
        message: 'Unauthorized. Action forbidden.'
    });
    if (1 != 1) {
        console.log('register');
        Candidate.find().lean().exec(function (err, candidates) {
            if (err)
                console.log(err);
            if (req.session.logged) {
                if (typeof _.find(candidates, {username: req.session.user.name}) == 'undefined') {
                    res.render('candidates/register', {});
                } else {
                    res.render('error', {
                        error: {status: 'You have already registered as a candidate.', 'stack': ''},
                        message: 'Already registered.'
                    });
                }
            } else {
                res.redirect('/login?returnurl=' + encodeURIComponent(req.originalUrl));
            }
        });
    }
});

router.get('/update', function (req, res, next) {
    Candidate.find().lean().exec(function (err, candidates) {
        if (err)
            console.log(err);
        if (req.session.logged) {
            var candidate = _.find(candidates, {username: req.session.user.name});
            console.log(candidate);
            if (typeof candidate != 'undefined') {
                var isleader = _.includes(leaders, req.session.user.name);
                var party = '';
                if (isleader) {
                    party = _.invert(leaders)[req.session.user.name];
                }

                res.render('candidates/update', {
                    candidate: candidate,
                    isleader: isleader,
                    party: party
                });

            } else {
                res.status(403).render('error', {
                    error: {status: 'You have yet registered as a candidate.', 'stack': ''},
                    message: 'Not registered.'
                });
            }
        } else {
            res.redirect('/login?returnurl=' + encodeURIComponent(req.originalUrl));
        }
    });
});

router.get('/process', function (req, res, next) {
    if (req.session.logged) {
        if (_.includes(leaders, req.session.user.name)) {
            var party = _.invert(leaders)[req.session.user.name];
            var query = {};
            if (party != 'SPEAKER') {
                query = {party: party};
            }
            Candidate.find(query).lean().exec(function (err, candidates) {
                if (err) {
                    console.log(err);
                } else {
                    res.render('candidates/process', {
                        candidates: candidates
                    });
                }
            });

        } else {
            res.status(403).render('error', {
                error: {status: '403', 'stack': 'Status of party leader or speaker required.'},
                message: 'Unauthorized. Action forbidden.'
            });
        }
    } else {
        res.redirect('/login?returnurl=' + encodeURIComponent(req.originalUrl));
    }
});

module.exports = router;
