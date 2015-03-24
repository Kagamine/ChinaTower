"use strict"
var express = require('express');
var router = express.Router();

router.get('/', function (req, res, next) {
    req.session.uid = null;
    res.render('login/index', { title: '登录', layout: false });
});

module.exports = router;
