"use strict"
var express = require('express');
var router = express.Router();

/* GET home page. */

router.get('/', auth.authorize, function(req, res, next) {
    res.render('home/index', { title: '黑龙江省铁塔公司规划系统' });
});

module.exports = router;
