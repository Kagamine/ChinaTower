"use strict"
var express = require('express');
var router = express.Router();

router.get('/', auth.authorize, function (req, res, next) {
    res.render('system/index', { title: '系统管理' });
});

router.post('/', auth.authorize, function (req, res, next) {

});

module.exports = router;
