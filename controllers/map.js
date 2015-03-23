"use strict"
var express = require('express');
var router = express.Router();
var p2l = require('../lib/p2l.js');

var signalCache;

router.get('/', auth.authorize, function (req, res, next) {
    if (signalCache) {
        res.send(signalCache);
    } else {
        db.signal.find()
            .sort({ order: 1 })
            .exec()
            .then(function (signal) {
                console.log(signal.length + '条记录读取完毕');
                let lines = p2l(signal);
                console.log(lines.length + '条线段已生成');
                signalCache = JSON.stringify(lines);
                res.send(signalCache);
            })
            .then(null, next);
    }
});

module.exports = router;
