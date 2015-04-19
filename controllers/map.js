"use strict"
var express = require('express');
var router = express.Router();

router.get('/', auth.authorize, function (req, res, next) {
    res.render('map/index', { title: '地图展示', map: true });
});

module.exports = router;
