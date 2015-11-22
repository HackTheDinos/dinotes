var express = require('express');
var router = express.Router();
var session = require('express-session');
var MongoClient = require('mongodb').MongoClient;

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

/* GET users listing. */
router.get('/login', function(req, res, next) {
    console.log(req.session);
    if(db == null) {
        res.status(500);
        res.send("No mongo connection, please try again later");
        return;
    }
    users.find({'user': req.query.user, 'password': req.query.pass}).toArray(function(err, docs) {
        if(docs.length == 0) {
            res.status(401);
            res.send("Invalid user/password");
            return;
        }
        req.session.user = docs[0].user;
        res.send(docs[0]);
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

module.exports = router;
