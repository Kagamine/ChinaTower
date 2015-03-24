"use strict"
var express = require('express');
var router = express.Router();

router.get('/', auth.authorize, function (req, res, next) {
    db.serieses.find()
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
            let signals = JSON.parse(db.fs.readFileSync(req.files.file.path));
            let i = 0;
            signals.forEach(x => {
                let signal = new db.signal();
                signal.lon = x.lon;
                signal.lat = x.lat;
                signal.signal = x.signal;
                signal.series = series._id;
                signal.order = i++;
                if (i == 0)
                    console.log(signal);
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
