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
    try {
        notes.findOne({'_id': ObjectID(req.params.id)}, function(err, docs) {
            res.send(docs);
        });
    }
    catch(e) {
        res.status(500);
        res.send(e);
    }
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
                if(!docs) {
                    err = "Nonexistent user";
                }
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

router.put('/note/:id', function(req, res, next) {
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
    /*
     * Check if user exists
     * Get note and check if user has permissions
     * Make the change to the note
     * Hope no races occurred...
     */
    async.waterfall([
        function(callback) {
            users.findOne({user: req.session.user}, function(err, docs) {
                if(!docs) {
                    err = "Nonexistent user";
                }
                callback(err, docs);
            });
        },
        function(user, callback) {
            try {
                notes.findOne({'_id': ObjectID(req.params.id)}, function(err, docs) {
                    if(!docs) {
                        err = "Note not found";
                        callback(err, docs);
                        return;
                    }
                    if(docs.owner.toString() && docs.owner.toString() == user['_id']) {
                        callback(err, docs);
                        return;
                    }
                    if(docs.collaborators && docs.collaborators.includes(user['_id'].toString())) {
                        callback(err, docs);
                        return;
                    }
                    callback('No write access', docs);
                });
            }
            catch(e) {
                callback(e, null);
            }
        },
        function(prev, callback) {
            try {
                notes.updateOne({'_id': ObjectID(req.params.id)}, { $set: {contents: req.body}}, function(err, result) {
                    callback(err, result);
                });
            }
            catch(e) {
                callback(e, null);
            }
        }
    ],
    function(err, result) {
        if(err) {
            res.status(400);
            res.send(err);
            return;
        }
        res.send(result);
    });
});


module.exports = router;
