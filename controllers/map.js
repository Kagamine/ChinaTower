"use strict"
var express = require('express');
var router = express.Router();
var p2l = require('../lib/p2l.js');

var signalCache = {};

router.get('/', auth.authorize, function (req, res, next) {
    if (req.query.series) {
        if (signalCache[req.query.series]) {
            res.send(signalCache[req.query.series]);
        } else {
            db.signal.find({ series: req.query.series })
            .sort({ order: 1 })
            .exec()
            .then(function (signal) {
                console.log(signal.length + '条记录读取完毕');
                let lines = p2l(signal);
                console.log(lines.length + '条线段已生成');
                    signalCache[req.query.series] = JSON.stringify(lines);
                res.send(signalCache[req.query.series]);
            })
            .then(null, next);
        }
    }
    else {
        let seriesId;
        db.serieses.find()
            .sort({ time: -1 })
            .limit(1)
            .exec()
            .then(function (series) {
                seriesId = series[0]._id.toString();
                if (signalCache[seriesId]) {
                    res.send(signalCache[seriesId]);
                } else {
                    db.signal.find({ series: seriesId })
                        .sort({ order: 1 })
                        .exec()
                        .then(function (signal) {
                            console.log(signal.length + '条记录读取完毕');
                            let lines = p2l(signal);
                            console.log(lines.length + '条线段已生成');
                            signalCache[seriesId] = JSON.stringify(lines);
                            res.send(signalCache[seriesId]);
                        })
                        .then(null, next);
                }
            })
            .then();
    }
});

router.get('/old', auth.authorize, function (req, res, next) {
    db.signal.find()
        .sort({ order: 1 })
        .exec()
        .then(function (signal) {
            res.send(JSON.stringify(signal.map(x => {
                return {
                    lon: x.lon,
                    lat: x.lat,
                    signal: x.signal
                }
            })));
        })
        .then(null, next);
});

module.exports = router;
