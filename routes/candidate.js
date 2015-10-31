var express = require('express');
var mongoose = require('mongoose');
var Candidate = require('../models/candidate');
var _ = require('lodash');
var config = require('config');
var db = config.get('db');
var leaders = config.get('leaders');

var router = express.Router();

mongoose.createConnection(db.uri, {user: db.user, pass: db.pass});
mongoose.connection.on('error', console.log);

function isEligible(created_utc) {
    return ((Math.floor(Date.now() / 1000) - created_utc) / 2592000) > 2.9999;
}

var elec_default = new Date(2015, 10 - 1, 30);

router.route('/')
    .post(function (req, res) {
        if (req.session.logged) {
            if (_.invert(leaders)[req.session.user.name] == 'SPEAKER') {
                var candidate = new Candidate();
                candidate.username = req.body.username;
                candidate.isleader = _.includes(leaders, req.body.username);
                candidate.party = req.body.party;
                candidate.elecdist = req.body.elecdist;
                candidate.endorsed = req.body.endorsed;
                //candidate.election = req.body.election;

                candidate.election = elec_default;
                console.log(req.body);

                if (isEligible(req.session.user.created_utc)) {
                    candidate.save(function (err) {
                        if (err) {
                            res.json({error: err});
                        } else {
                            res.json({message: 'Candidate created!'});
                        }
                    });
                } else {
                    res.json({message: 'Ineligible because of account age. >< Sorry. You can still participate without being an MP.'});
                }
            } else if (_.includes(leaders, req.session.user.name)) {
                var candidate = new Candidate();
                candidate.username = req.body.username;
                candidate.isleader = _.includes(leaders, req.body.username);
                candidate.party = _.invert(leaders)[req.session.user.name];
                candidate.elecdist = req.body.elecdist;
                candidate.endorsed = true;
                candidate.election = elec_default;
                console.log(req.body);
                console.log((_.invert(leaders)[req.session.user.name]));

                if (isEligible(req.session.user.created_utc)) {
                    candidate.save(function (err) {
                        if (err) {
                            res.json({error: err});
                        } else {
                            res.json({message: 'Candidate created!'});
                        }
                    });
                } else {
                    res.json({error: 'Ineligible because of account age. >< Sorry. You can still participate without being an MP.'});
                }
            } else {
                var candidate = new Candidate();
                candidate.username = req.session.user.name;
                candidate.isleader = _.includes(leaders, req.session.user.name);
                candidate.party = req.body.party;
                candidate.elecdist = req.body.elecdist;
                candidate.election = elec_default;
                if (req.body.party === 'IND') {
                    candidate.endorsed = true;
                } else {
                    candidate.endorsed = false;
                }
                console.log(req.body);

                if (isEligible(req.session.user.created_utc)) {
                    candidate.save(function (err) {
                        if (err) {
                            res.json({error: err, message: 'Error'});
                        } else {
                            res.json({message: 'Candidate created!'});
                        }
                    });
                } else {
                    res.json({message: 'Ineligible because of account age. >< Sorry. You can still participate without being an MP.'});
                }
            }
        } else {
            res.status(403).json({error: 'Unauthorized. Action forbidden.'});
        }
    })
    .get(function (req, res) {
        Candidate.find(function (err, candidates) {
            if (err) {
                res.send(err);
                return;
            }

            res.json(candidates);
        });
    });

router.route('/:candidate_id')
    .get(function (req, res) {
        Candidate.findById(req.params.candidate_id, function (err, candidate) {
            if (err) {
                res.send(err);
            } else {
                res.json(candidate);
            }
        });
    })
    .put(function (req, res) {
        if (req.session.logged) {
            Candidate.findById(req.params.candidate_id, function (err, candidate) {
                if (err)
                    res.send(err);

                var authorized = false;
                if (_.invert(leaders)[req.session.user.name] == 'SPEAKER') {
                    candidate.username = req.body.username;
                    candidate.isleader = req.body.isleader;
                    candidate.party = req.body.party;
                    candidate.elecdist = req.body.elecdist;
                    candidate.endorsed = req.body.endorsed;

                    authorized = true;
                } else if (_.includes(leaders, req.session.user.name)) {
                    if (candidate.party === _.invert(leaders)[req.session.user.name]) {
                        candidate.username = req.body.username;
                        candidate.elecdist = req.body.elecdist;
                        candidate.endorsed = req.body.endorsed;

                        authorized = true;
                    } else {
                        authorized = false;
                    }
                } else if (req.session.user.name === candidate.username) {
                    candidate.elecdist = req.body.elecdist;
                    candidate.party = req.body.party;
                    console.log('authorized');
                    console.log(req.body);

                    authorized = true;
                } else {
                    authorized = false;
                }

                if (authorized) {
                    candidate.save(function (err) {
                        if (err) {
                            res.send(err);
                        } else {
                            res.json({message: 'Candidate updated!'});
                        }
                    });
                } else {
                    res.status(403).json({error: 'Unauthorized. Action forbidden.'});
                }
            });
        } else {
            res.status(403).json({error: 'Unauthorized. Action forbidden.'});
        }
    })
    .delete(function (req, res) {
        if (req.session.logged) {
            if (_.invert(leaders)[req.session.user.name] === 'SPEAKER') {
                Candidate.remove({
                    _id: req.params.candidate_id
                }, function (err, candidate) {
                    if (err) {
                        res.send(err);
                    } else {
                        res.json({message: 'Successfully deleted'});
                    }
                });
            } else {
                res.status(403).json({error: 'Unauthorized. Action forbidden.'});
            }
        } else {
            res.status(403).json({error: 'Unauthorized. Action forbidden.'});
        }
    })
    .patch(function (req, res) {
        if (req.session.logged) {
            Candidate.findById(req.params.candidate_id, function (err, candidate) {
                if (err)
                    res.send(err);
                var authorized = false;

                if (_.invert(leaders)[req.session.user.name] == 'SPEAKER') {
                    authorized = true;
                } else if (_.includes(leaders, req.session.user.name)) {
                    if (candidate.party === _.invert(leaders)[req.session.user.name]) {
                        authorized = true;
                    } else {
                        authorized = false;
                    }
                }

                if (authorized) {
                    var update = {};
                    for (var field in req.body) {
                        if (field == 'endorsed') {
                            update[field] = req.body[field];
                        }
                    }
                    Candidate.update({_id: req.params.candidate_id}, {$set: update}, function (upd_err, numAffected) {
                        if (upd_err) {
                            res.send(upd_err);
                            return;
                        } else {
                            res.json({message: 'Successfully updated'});
                        }
                    });
                } else {
                    res.status(403).json({error: 'Unauthorized. Action forbidden.'});
                }

            });
        } else {
            res.status(403).json({error: 'Unauthorized. Action forbidden.'});
        }
    });

router.route('/name/:candidate_name')
    .get(function (req, res) {
        Candidate.find({username: req.params.candidate_name}, function (err, candidate) {
            if (err) {
                res.send(err);
                return;
            }
            res.json(candidate);
        });
    })

module.exports = router;