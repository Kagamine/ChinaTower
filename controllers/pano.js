'use strict'
var express = require('express');
var router = express.Router();

router.get('/', auth.authorize, function (req, res, next) {
    if (req.query.raw)
        return next();
    res.render('pano/index', { title: '实景勘察' });
});

router.get('/', auth.authorize, function (req, res, next) {
    if (!req.query.raw)
        return next();
    let query = db.towers.find();
    if (req.query.district)
        query = query.where({ district: req.query.district });
    if (req.query.city)
        query = query.where({ city: req.query.city });
    if (req.query.type)
        query = query.where({ type: req.query.type });
    if (req.query.provider)
        query = query.where({ provider: new RegExp('.*' + req.query.provider + '.*') });
    if (req.query.name)
        query = query.where({ name: new RegExp('.*' + req.query.name + '.*') });
    if (req.query.status)
        query = query.where({ status: req.query.status });
    query
        .skip((req.query.p - 1) * 50)
        .limit(50)
        .sort({ status: -1 })
        .exec()
        .then(function (towers) {
            res.render('pano/raw', { layout: false, towers: towers });
        })
        .then(null, next);
});

module.exports = router;
