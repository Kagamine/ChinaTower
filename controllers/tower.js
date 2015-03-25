"use strict"
var express = require('express');
var router = express.Router();

router.get('/positions', auth.authorize, function (req, res, next) {
    db.towers.find()
        .exec()
        .then(function (towers) {
            res.send(JSON.stringify(towers));
        })
        .then(null, next);
});

router.get('/', auth.authorize, function (req, res, next) {
    if (!req.query.raw)
        return next();
    let query = db.towers.find();
    if (req.query.district)
        query = query.where({ district: req.query.district });
    if (req.query.type)
        query = query.where({ type: req.query.type });
    if (req.query.provider)
        query = query.where({ provider: new RegExp('.*' + req.query.provider + '.*') });
    if (req.query.name)
        query = query.where({ name: new RegExp('.*' + req.query.name + '.*') });
    query
        .skip((req.query.p - 1) * 50)
        .limit(50)
        .exec()
        .then(function (towers) {
            res.render('tower/raw', { layout: false, towers: towers });
        })
        .then(null, next);
});

router.get('/', auth.authorize, function (req, res, next) {
    if (req.query.raw)
        return next();
    res.render('tower/index', { title: '铁塔管理' });
});

router.post('/edit', auth.authorize, function (req, res, next) {
    if (req.files.file) {
        let writestream = db.gfs.createWriteStream({
            filename: req.files.file.originalname
        });
        db.fs.createReadStream(req.files.file.path).pipe(writestream);
        writestream.on('close', function (file) {
            db.fs.unlink(req.files.file.path);
            db.towers.update({ _id: req.body.id }, {
                picture: file._id
            }).exec();
        });
    }
    db.towers.update({ _id: req.body.id }, {
        lon: req.body.lon,
        lat: req.body.lat,
        name: req.body.name,
        district: req.body.district,
        provider: req.body.provider,
        height: req.body.height,
        type: req.body.type,
        url: req.body.url
    }).exec();
    res.redirect('/tower');
});

router.post('/delete', auth.authorize, function (req, res, next) {
    db.towers.remove({ _id: req.body.id }).exec();
    res.send('true');
});

router.post('/create', auth.authorize, function (req, res, next) {
    let tower = new db.towers();
    tower.name = req.body.name;
    tower.height = req.body.height;
    tower.provider = req.body.provider;
    tower.type = req.body.type;
    tower.district = req.body.district;
    tower.lon = req.body.lon;
    tower.lat = req.body.lat;
    tower.url = req.body.url;
    tower.save(function (err, tower) {
        if (req.files.file) {
            let writestream = db.gfs.createWriteStream({
                filename: req.files.file.originalname
            });
            db.fs.createReadStream(req.files.file.path).pipe(writestream);
            writestream.on('close', function (file) {
                db.fs.unlink(req.files.file.path);
                db.towers.update({ _id: tower._id }, {
                    picture: file._id
                }).exec();
            });
        }
        res.redirect('/');
    });
});

router.post('/import', auth.authorize, function (req, res, next) {
    if (req.files.file) {
        let file = db.fs.readFileSync(req.files.file.path);
        file = file.toString().split('\n');
        file.forEach(x => {
            x = x.replace(/\t/g, ' ');
            x = x.replace(/     /g, ' ');
            x = x.replace(/    /g, ' ');
            x = x.replace(/   /g, ' ');
            x = x.replace(/  /g, ' ');
            x = x.split(' ');
            let tower = new db.towers();
            tower.name = x[0];
            tower.district = x[1];
            if (x[2].trim() == '中国移动')
                tower.provider = 'China Mobile';
            else if (x[2].trim() == '中国联通')
                tower.provider = 'China Unicom';
            else
                tower.provider = 'China Telecom';
            tower.type = x[3];
            tower.height = x[4];
            tower.lon = x[5];
            tower.lat = x[6];
            tower.save();
        });
    }
    res.redirect('/tower');
});

module.exports = router;
