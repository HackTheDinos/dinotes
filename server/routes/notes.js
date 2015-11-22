var express = require('express');
var router = express.Router();
var session = require('express-session');
var MongoClient = require('mongodb').MongoClient;
var ObjectID = require('mongodb').ObjectID;
var async = require('async');

var db = null;
var users = null;
var notes = null;
var url = 'mongodb://localhost:27017/dinotes';
MongoClient.connect(url, function(err, database) {
    if(err != null) {
        console.error("Alert: no db connection :(");
    }
    else {
        db = database;
        users = database.collection('users');
        notes = database.collection('notes');
        console.log("Connected correctly to server");
    }
});

router.get('/note/:id', function(req, res, next) {
    if(db == null) {
        res.status(500);
        res.send("No mongo connection, please try again later");
        return;
    }
    notes.findOne({'_id': ObjectID(req.params.id)}, function(err, docs) {
        res.send(docs);
    });
});

/*
 * Provide raw JSON to be inserted into contents
 */
router.post('/new', function(req, res, next) {
    if(!req.session.user) {
        res.status(401);
        res.send("Not logged in");
        return;
    }
    if(db == null) {
        res.status(500);
        res.send("No mongo connection, please try again later");
        return;
    }
    async.waterfall([
        function(callback) {
            users.findOne({'user': req.session.user}, function(err, docs) {
                callback(err, docs);
            });
        },
        function(user, callback) {
            var note = {owner: user['_id']};
            note.contents = req.body;
            notes.insert(note, function(err, result) {
                callback(err, result);
            });
        }
    ],
    function(err, result) {
        if(err) {
            res.status(500);
            res.send(err);
            return;
        }
        res.send(result);
    });
});


module.exports = router;
