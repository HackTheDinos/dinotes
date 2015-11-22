var express = require('express');
var router = express.Router();
var session = require('express-session');
var MongoClient = require('mongodb').MongoClient;
var async = require('async');
var bcrypt = require('bcrypt');

var BC_LEVEL = 10;
var db = null;
var users = null;
var url = 'mongodb://localhost:27017/dinotes';
MongoClient.connect(url, function(err, database) {
    if(err != null) {
        console.error("Alert: no db connection :(");
    }
    else {
        db = database;
        users = database.collection('users');
        console.log("Connected correctly to server");
    }
});

router.get('/login', function(req, res, next) {
    if(db == null) {
        res.status(500);
        res.send("No mongo connection, please try again later");
        return;
    }
    async.waterfall([
        function(callback) {
            users.findOne({'user': req.query.user}, function(err, docs) {
                if(!docs) {
                    err = "Invalid user";
                    callback(err, docs);
                    return;
                }
                callback(err, docs);
            });
        },
        function(docs, callback) {
            bcrypt.compare(req.query.pass, docs.password, function(err, res) {
                if(res) {
                    req.session.user = docs.user;
                }
                else {
                    err = "Invalid password";
                }
                callback(err, docs);
            });
        }
    ],
    function(err, result) {
        if(err) {
            res.status(401);
            res.send(err);
        }
        else {
            res.send(result);
        }
    });
});

router.get('/logout', function(req, res, next) {
    req.session.user = null;
    res.send("Logged out");
});

router.get('/me', function(req, res, next) {
    if(db == null) {
        res.status(500);
        res.send("No mongo connection, please try again later");
        return;
    }
    if(!req.session.user) {
        res.status(401);
        res.send("Not logged in");
        return;
    }
    users.findOne({'user': req.session.user}, function(err, docs) {
        res.send(docs);
    });
});

router.get('/create', function(req, res, next) {
    if(db == null) {
        res.status(500);
        res.send("No mongo connection, please try again later");
        return;
    }
    async.waterfall([
        function(callback) {
            users.findOne({'user': req.query.user}, function(err, docs) {
                if(docs)
                    err = "User exists";
                callback(err, docs);
            });
        },
        function(docs, callback) {
            bcrypt.hash(req.query.pass, BC_LEVEL, function(err, hash) {
                if(err) {
                    callback(err);
                    return;
                }
                console.log(hash);
                callback(err, hash);
            });
        },
        function(hash, callback) {
            users.insertOne({'user': req.query.user, 'password': hash}, function(err, result) {
                callback(err, result);
            });
        }
    ],
    function(err, result) {
        if(err) {
            res.status(400);
            res.send(err);
        }
        res.send(result);
    });
});

router.get('/tasks', function(req, res, next) {
    if(db == null) {
        res.status(500);
        res.send("No mongo connection, please try again later");
        return;
    }
    if(!req.session.user) {
        res.status(401);
        res.send("Not logged in");
        return;
    }
    users.findOne({'user': req.session.user}, function(err, docs) {
        res.send(docs.tasks);
    });
});

router.put('/tasks', function(req, res, next) {
    if(db == null) {
        res.status(500);
        res.send("No mongo connection, please try again later");
        return;
    }
    if(!req.session.user) {
        res.status(401);
        res.send("Not logged in");
        return;
    }
    users.findAndModify({'user': req.session.user}, {$set: {'tasks': req.body}}, function(err, result) {
        res.send(result);
    });
});

module.exports = router;
