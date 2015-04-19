'use strict'
var express = require('express');
var router = express.Router();
var fs = require('fs');

router.get('/', auth.authorize, function (req, res, next) {
    res.render('setting/index', { title: '参数设定', settings: settings });
});

router.post('/', auth.authorize, function (req, res, next) {
    settings.share = {};
    settings.share.crowded = req.body.crowded;
    settings.share.suburb = req.body.suburb;
    settings.share.village = req.body.village;
    settings.share.city = req.body.city;
    settings.plan = {};
    settings.plan.crowded = req.body._crowded;
    settings.plan.suburb = req.body._suburb;
    settings.plan.village = req.body._village;
    settings.plan.city = req.body._city;
    fs.writeFileSync(__dirname + '/../config.json', JSON.stringify(settings));
    res.redirect('/setting');
    shareCache = null;
});

module.exports = router;
