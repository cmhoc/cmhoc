var express = require('express');
var mongoose = require('mongoose');
var Election = require('../models/election');
var Candidate = require('../models/candidate');
var moment = require('moment');
var _ = require('lodash');
var config = require('config');
var db = config.get('db');
var banned = config.get('banned');

var router = express.Router();

mongoose.createConnection(db.uri, {
    user: db.user,
    pass: db.pass
});
mongoose.connection.on('error', console.log);

function isEligible(created_utc) {
    return ((Math.floor(Date.now() / 1000) - created_utc) / 2592000) > 2.9999;
}

router.post('/vote/:elec_id', function(req, res, next) {

    if (req.session.logged) {
        Election.findById(req.params.elec_id, function(err, election) {
            if (err) {
                res.send(err);
                return;
            }
            if (!_.includes(_.pluck(election.votes, 'elector'), req.session.user.name)) {
                if (moment().isBefore(election.end) && moment().isAfter(election.start)) {
                    var vote = {};
                    var rankings = [];
                    var authorized = false;
                    
                    console.log(req.session.user.name + ':' + req.body);
                    
                    for (var field in req.body) {
                        var ranking = {};
                        ranking.candidate = mongoose.Types.ObjectId(field);
                        ranking.ranking = req.body[field];
                        
                        _(rankings).push(ranking).commit();
                    }
        
                    vote.time = Date.now();
                    vote.elector = req.session.user.name;
                    vote.ip = req.headers['x-real-ip'] || req.connection.remoteAddress;
                    vote.add_info = 'voted at' + moment().format('MMMM D, YYYY, HH:mm:ssZ');
                    vote.vote = rankings;
        
                    if (isEligible(req.session.user.created_utc)) {
                        if (!_.includes(banned, req.session.user.name)) {
                            authorized = true;
                        } else {
                            authorized = false;
                        }
                    } else {
                        authorized = false;
                    }
        
                    if (authorized) {
                        Election.update({_id: req.params.elec_id},
                            {$push: {votes: vote}},
                            function(upd_err, numAffected) {
                                if (upd_err) {
                                    res.send(upd_err);
                                    return;
                                } else {
                                    res.json({
                                        message: 'Successfully voted. Thank you.'
                                    });
                                }
                            });
                    } else {
                        res.status(403).json({
                            message: 'Unauthorized. You are: (a) ineligible because '
                                + 'of account age; or (b) banned by the Speaker.'
                        });
                    }
                } else {
                    res.status(403).json({
                        message: 'Error. Voting either has not started or has ended.'
                    });
                }
            } else {
                res.status(403).json({
                    message: 'Unauthorized. You can only vote once.'
                });
            }
        });
    }
    else {
        res.status(403).json({
            message: 'Unauthorized. Please log in.'
        });
    }
});

router.get('/:elec_id', function(req, res, next) {
    if(typeof req.query.elec_dist !== 'undefined') {
        res.redirect('/vote/' + req.params.elec_id + '/' + req.query.elec_dist)
    }
    if (req.session.logged) {
        Election.findById(req.params.elec_id, function (err, election) {
            if (err) {
                res.send(err);
                return;
            }
            if (moment().isBetween(election.start, election.end)) {
                if (!_.includes(_.pluck(election.votes, 'elector'), req.session.user.name)) {
                    res.render('vote/vote', {
                        election: election
                    });
                } else {
                    res.status(403).render('error', {
                        error: {status: '403', 'stack': 'Unauthorized. You can only vote once.'},
                        message: 'Duplicate vote'
                    });
                }
            } else {
                res.status(403).render('error', {
                        error: {status: '403', 'stack': 'Voting either has not started or has ended.'
                        },
                        message: 'Unauthorized.'
                });
            }
        });
    } else {
        res.redirect('/login?returnurl=' + encodeURIComponent(req.originalUrl));
    }
});

router.get('/:elec_id/:district', function(req, res, next) {
    if (req.session.logged) {
        Election.findById(req.params.elec_id, function (err, election) {
            if (err) {
                res.send(err);
                return;
            }
            if (moment().isBetween(election.start, election.end)) {
                if (!_.includes(_.pluck(election.votes, 'elector'), req.session.user.name)) {
                    Candidate.find({elecdist: req.params.district}).lean().exec(function (err, candidates) {
                        if (err) {
                            console.log(err);
                            return;
                        }
                        if (req.session.logged) {
                            candidates = _.sortBy(candidates, 'party');
                            res.render('vote/district', {
                                candidates: candidates,
                                election: election
                            });
                        } else {
                            res.redirect('/login?returnurl=' + encodeURIComponent(req.originalUrl));
                        }
                    });
                } else {
                    res.status(403).render('error', {
                        error: {status: '403', 'stack': 'Unauthorized. You can only vote once.'},
                        message: 'Duplicate vote'
                    });
                }
            } else {
                res.status(403).render('error', {
                        error: {status: '403', 'stack': 'Voting either has not started or has ended.'},
                        message: 'Unauthorized.'
                });
            }
        });
    } else {
        res.redirect('/login?returnurl=' + encodeURIComponent(req.originalUrl));
    }
});

module.exports = router;