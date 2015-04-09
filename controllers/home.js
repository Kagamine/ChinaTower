"use strict"
var express = require('express');
var router = express.Router();

/* GET home page. */

router.get('/', auth.authorize, function(req, res, next) {
    res.render('map/index', { title: '地图展示' });
});

router.get('/update', function (req, res, next) {
    db.towers.update({  }, {
        picture: "551016af520dd4080c03d5dd"
    }, {multi: true}).exec();
});

module.exports = router;
