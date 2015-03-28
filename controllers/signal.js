"use strict"
var express = require('express');
var p2l = require('../lib/p2l');
var router = express.Router();

router.get('/', auth.authorize, function (req, res, next) {
    db.serieses.find()
        .sort({ time: -1 })
        .exec()
        .then(function (serieses) {
            res.render('signal/index', { title: '信号管理', serieses: serieses });
        })
        .then(null, next);
});

router.post('/import', auth.authorize, function (req, res, next) {
    if (req.files.file) {
        let series = new db.serieses();
        series.title = req.body.title;
        series.time = Date.now();
        series.save(function (err, series) {
            let points = [];
            let file = db.fs.readFileSync(req.files.file.path);
            file = file.toString().split('\n');
            let i = 0;
            file.forEach(x => {
                try {
                    x = x.replace(/\t/g, ' ');
                    x = x.replace(/     /g, ' ');
                    x = x.replace(/    /g, ' ');
                    x = x.replace(/   /g, ' ');
                    x = x.replace(/  /g, ' ');
                    x = x.split(' ');
                    let signal = {};
                    signal.lon = x[0];
                    signal.lat = x[1];
                    signal.signal = x[2];
                    signal.order = i++;
                    points.push(signal);
                } catch (e) {
                    console.error(e);
                }
            });
            let ret = p2l(points);
            ret.forEach(x => {
                let rxlevLine = new db.rxlevLines();
                rxlevLine.points = [];
                x.points.forEach(y => {
                    rxlevLine.points.push(y);
                });
                rxlevLine.series = series._id;
                rxlevLine.color = x.color;
                rxlevLine.save();
            });
        });
    }
    res.redirect('/signal');
});

router.post('/delete', auth.authorize, function (req, res, next) {
    db.serieses.remove({ _id: req.body.id })
        .exec(function () {
            res.redirect('/signal');
        });
});

module.exports = router;
