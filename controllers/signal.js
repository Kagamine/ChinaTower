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
                rxlevLine.year = moment(new Date).format('YYYY');
                rxlevLine.month = (new Date).getMonth() + 1;
                rxlevLine.save();
            });
            rxlevCache = null;
        });
    }
    res.redirect('/signal');
});

router.post('/delete', auth.authorize, function (req, res, next) {
    db.serieses.remove({ _id: req.body.id }, { justOne: false })
        .exec(err, function () {
            db.rxlevLines.remove({ series: req.body.id }).exec(err, function () {
                rxlevCache = null;
                res.redirect('/signal');
            });
        });
});

let rxlevCache = null;
let EarthRadiusKm = 6378.137;

function getDistance (p1Lat, p1Lng, p2Lat, p2Lng)
{
    let dLat1InRad = p1Lat * (Math.PI / 180);
    let dLong1InRad = p1Lng * (Math.PI / 180);
    let dLat2InRad = p2Lat * (Math.PI / 180);
    let dLong2InRad = p2Lng * (Math.PI / 180);
    let dLongitude = dLong2InRad - dLong1InRad;
    let dLatitude = dLat2InRad - dLat1InRad;
    let a = Math.pow(Math.sin(dLatitude / 2), 2) + Math.cos(dLat1InRad) * Math.cos(dLat2InRad) * Math.pow(Math.sin(dLongitude / 2), 2);
    let c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    let dDistance = EarthRadiusKm * c;
    return dDistance * 1000;
}

router.get('/rxlev', auth.authorize, function (req, res, next) {
    if (parseFloat(req.query.right) - parseFloat(req.query.left) > 1.188078574995771)
    {
        console.log(req.query.year, req.query.month, 'empty');
        res.send('[]');
        return;
    }
    if (rxlevCache) {
        res.send(rxlevCache.filter(x => x.year == req.query.year && x.month == req.query.month && x.points.some(y => parseFloat(y.lon) >= parseFloat(req.query.left) && parseFloat(y.lon) <= parseFloat(req.query.right) && parseFloat(y.lat) >= req.query.bottom && parseFloat(y.lat) <= parseFloat(req.query.top))));
    }
    else {
        db.rxlevLines.find()
            .populate('series')
            .sort({ order: 1 })
            .exec()
            .then(function (lines) {
                console.log(req.query.year, req.query.month, 'new');
                rxlevCache = lines;
                let result = rxlevCache.filter(x => x.year == req.query.year && x.month == req.query.month && x.points.some(y => parseFloat(y.lon) >= parseFloat(req.query.left) && parseFloat(y.lon) <= parseFloat(req.query.right) && parseFloat(y.lat) >= req.query.bottom && parseFloat(y.lat) <= parseFloat(req.query.top)));
                res.send(result);
            })
            .then(null, next);
    }
});

module.exports = router;
