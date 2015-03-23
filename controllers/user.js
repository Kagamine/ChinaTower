"use strict"
var express = require('express');
var crypto = require('../lib/cryptography');
var router = express.Router();

router.get('/', auth.authorize, function (req, res, next) {
    db.users.find()
        .select('_id username email')
        .exec()
        .then(function (users) {
            res.render('user/index', { title: '用户管理', users: users });
        })
        .then(null, next);
});

router.post('/delete', auth.authorize, function (req, res, next) {
    if (req.session.uid == req.body.id) {
        return res.send('false');
    }
    db.users.remove({ _id: req.body.id }).exec();
    res.send('true');
});

router.post('/edit', auth.authorize, function (req, res, next) {
    db.users.update({ _id: req.body.id }, {
        password: crypto.sha256(req.body.password)
    }).exec();
    res.send(true);
});

router.post('/create', auth.authorize, function (req, res, next) {
    var user = new db.users();
    user.username = req.body.username;
    user.password = crypto.sha256(req.body.password);
    user.email = req.body.email;
    user.save(function () {
        res.redirect('/user');
    });
});

module.exports = router;
