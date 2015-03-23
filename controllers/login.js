"use strict"
var express = require('express');
var crypto = require('../lib/cryptography');
var router = express.Router();

router.get('/', function (req, res, next) {
    res.render('login/index', { title: '登录', layout: false });
});

router.post('/', function (req, res, next) {
    db.users.findOne({ username: req.body.username, password: crypto.sha256(req.body.password) })
        .select('_id')
        .exec()
        .then(function (user) {
            if (user) {
                req.session.uid = user._id;
                res.redirect('/');
            } else {
                res.redirect('/login');
            }
        })
        .then(null, next);
});

module.exports = router;
