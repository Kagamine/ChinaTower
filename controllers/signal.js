"use strict"
var express = require('express');
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
            let file = db.fs.readFileSync(req.files.file.path);
            file = file.toString().split('\n');
            let i = 0;
            file.forEach(x => {
                x = x.replace(/\t/g, ' ');
                x = x.replace(/     /g, ' ');
                x = x.replace(/    /g, ' ');
                x = x.replace(/   /g, ' ');
                x = x.replace(/  /g, ' ');
                x = x.split(' ');
                let signal = new db.signal();
                signal.lon = x[0];
                signal.lat = x[1];
                signal.signal = x[2];
                signal.series = series._id;
                signal.order = i++;
                signal.save();
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
