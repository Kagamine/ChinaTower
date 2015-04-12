"use strict"
var express = require('express');
var router = express.Router();

var rxlevCache = {};

router.get('/', auth.authorize, function (req, res, next) {
    if (req.query.series) {
        if (rxlevCache[req.query.series]) {
            res.send(rxlevCache[req.query.series]);
        } else {
            db.rxlevLines.find({ series: req.query.series })
                .sort({ order: 1 })
                .exec()
                .then(function (lines) {
                    rxlevCache[req.query.series] = lines;
                    let result = rxlevCache[req.query.series].filter(x => x.points.some(y => parseFloat(y.lon) >= parseFloat(req.query.left) && parseFloat(y.lon) <= parseFloat(req.query.right) && parseFloat(y.lat) >= req.query.bottom && parseFloat(y.lat) <= parseFloat(req.query.top)));
                    console.log(result.length);
                    res.send(result);
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
                if (rxlevCache[seriesId]) {
                    res.send(rxlevCache[seriesId]);
                } else {
                    db.rxlevLines.find({ series: seriesId })
                        .sort({ order: 1 })
                        .exec()
                            .then(function (lines) {
                            rxlevCache[req.query.series] = lines;
                            let result = rxlevCache[req.query.series].filter(x => x.points.some(y => parseFloat(y.lon) >= parseFloat(req.query.left) && parseFloat(y.lon) <= parseFloat(req.query.right) && parseFloat(y.lat) >= req.query.bottom && parseFloat(y.lat) <= parseFloat(req.query.top)));
                            console.log(result.length);
                            res.send(result);
                        })
                        .then(null, next);
                }
            })
            .then();
    }
});

module.exports = router;
