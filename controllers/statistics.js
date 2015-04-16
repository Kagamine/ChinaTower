'use strict'
var express = require('express');
var router = express.Router();

router.get('/', auth.authorize, function (req, res, next) {
    res.render('statistics/index', { title: '统计分析' });
});

module.exports = router;
