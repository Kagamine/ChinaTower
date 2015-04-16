'use strict'
var express = require('express');
var fs = require('fs');
var router = express.Router();

router.get('/', auth.authorize, function (req, res, next) {
    var settings = JSON.parse(fs.readFileSync(__dirname + '/../config.json'));
    res.render('setting/index', { title: '参数设定', settings: settings });
});

module.exports = router;
