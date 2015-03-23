"use strict"
var express = require('express');
var router = express.Router();


/* GET home page. */
router.get('/build', auth.authorize, function (req, res, next) {
    let signals = tmp.split('\n');
    let i = 0;
    signals.forEach(x => {
        let src = x.split(' ');
        let signal = new db.signal();
        signal.lon = src[0];
        signal.lat = src[1];
        signal.signal = src[2];
        signal.order = i++;
        signal.save(function () {
            if (signal.order % 100 == 0)
                console.log(signal.order);
        });
    });
});

router.get('/', auth.authorize, function(req, res, next) {
    res.render('map/index', { title: '地图展示' });
});

router.get('/update', function (req, res, next) {
    db.towers.update({  }, {
        picture: "551016af520dd4080c03d5dd"
    }, {multi: true}).exec();
});

module.exports = router;