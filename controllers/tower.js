"use strict"
var express = require('express');
var router = express.Router();
var wgsdis = require('../lib/wgsdis');
var suggest = require('../lib/suggest');
var combine = require('../lib/combine');

let suggestCache;
GLOBAL.shareCache = null;

function buildShareCache()
{
    shareCache = [];
    db.towers.find()
        .exec(function (err, _towers) {
            let towers = _towers.map(x => x.toObject());
            let tmp = _.groupBy(towers, 'district');
            for (let x in tmp)
            {
                let result = wgsdis(tmp[x]);
                result.forEach(y => {
                    shareCache.push(y);
                });
            }
        });
}

function buildSuggestCache()
{
    suggestCache = [];
    db.towers.find()
        .exec(function (err, _towers) {
            let towers = _towers.map(x => x.toObject());
            let tmp = _.groupBy(towers, 'district');
            for (let x in tmp)
            {
                if (tmp[x].length > 2) {
                    let result = suggest(tmp[x]);
                    result.forEach(y => {
                        suggestCache.push({ lon: y.lon, lat: y.lat, radius: y.radius, status: '预选' });
                    });
                }
            }
        });
}

router.get('/initPosition', auth.authorize, function (req, res, next) {
    db.towers.find()
        .exec()
        .then(function (_towers) {
            let towers = _towers.map(x => x.toObject());
            if (res.locals.currentUser.city)
                towers = towers.filter(x => x.city == res.locals.currentUser.city);
            res.send(towers[0]);
        })
        .then(null, next);
});

router.get('/positions', auth.authorize, function (req, res, next) {
    db.towers.find()
        .exec()
        .then(function (_towers) {
            let towers = _towers.map(x => x.toObject());
            if (!suggestCache)
                buildSuggestCache();
            suggestCache.forEach(x => {
                towers.push(x);
            });
            towers = towers.filter(x => parseFloat(x.lon) >= parseFloat(req.query.left) && parseFloat(x.lon) <= parseFloat(req.query.right) && parseFloat(x.lat) >= req.query.bottom && parseFloat(x.lat) <= parseFloat(req.query.top));
            towers = combine(towers, req.query.left, req.query.right, req.query.top, req.query.bottom);
            if (res.locals.currentUser.city)
                towers = towers.filter(x => x.city == res.locals.currentUser.city);
            res.send(towers);
        })
        .then(null, next);
});

router.get('/sharing', auth.authorize, function (req, res, next) {
    if (!shareCache) buildShareCache();
    res.json(shareCache.filter(x => parseFloat(x.lon) >= parseFloat(req.query.left) && parseFloat(x.lon) <= parseFloat(req.query.right) && parseFloat(x.lat) >= req.query.bottom && parseFloat(x.lat) <= parseFloat(req.query.top)));
});

router.get('/share', auth.authorize, function (req, res, next) {
    if (!shareCache) buildShareCache();
    res.render('tower/share', { isShare: true, title: '整合分析', shares: shareCache.filter(x => x.begin.status != '预选' && x.end.status != '预选') });
});

router.get('/newap', auth.authorize, function (req, res, next) {
    if (!shareCache) buildShareCache();
    res.render('tower/share', { isShare: false, title: '新建分析', shares: shareCache.filter(x => x.begin.status == '预选' || x.end.status == '预选') });
});

router.get('/', auth.authorize, function (req, res, next) {
    if (!req.query.raw)
        return next();
    let query = db.towers.find();
    if (req.query.city)
        query = query.where({ city: req.query.city });
    if (req.query.district)
        query = query.where({ district: req.query.district });
    if (req.query.type)
        query = query.where({ type: req.query.type });
    if (req.query.provider)
        query = query.where({ provider: new RegExp('.*' + req.query.provider + '.*') });
    if (req.query.name)
        query = query.where({ name: new RegExp('.*' + req.query.name + '.*') });
    if (req.query.status)
        query = query.where({ status: req.query.status });
    if (!res.locals.isMaster)
        query = query.where({ city: res.locals.currentUser.city });
    query
        .skip((req.query.p - 1) * 50)
        .limit(50)
        .sort({ status: -1 })
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
    let opt = {
        lon: req.body.lon,
        lat: req.body.lat,
        name: req.body.name,
        district: req.body.district,
        provider: req.body.provider,
        height: req.body.height,
        type: req.body.type,
        url: req.body.url || '',
        scene: req.body.scene,
        address: req.body.address || '',
        status: req.body.status
    };
    if (!res.locals.isMaster)
        opt.city = req.locals.currentUser.city;
    else
        opt.city = req.body.city || '';
    db.towers.update({ _id: req.body.id }, opt).exec();
    res.redirect('/tower');
});

router.post('/delete', auth.authorize, function (req, res, next) {
    db.towers.remove({ _id: req.body.id }).exec();
    shareCache = null;
    res.send('true');
});

router.post('/deletemulti', auth.authorize, function (req, res, next) {
    let tmp = req.body.ids.split(' ');
    tmp.forEach(x => {
        db.towers.remove({ _id: x }).exec();
    });
    buildShareCache();
    buildSuggestCache();
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
    if (res.locals.currentUser.city)
        tower.city = res.locals.currentUser.city;
    else
        tower.city = req.body.city || '';
    tower.address = req.body.address || '';
    tower.status = req.body.status;
    suggestCache = null;
    shareCache = null;
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
        res.redirect('/map?lon=' + tower.lon + '&lat=' + tower.lat);
    });
});

router.post('/import', auth.authorize, function (req, res, next) {
    if (req.files.file) {
        let file = db.fs.readFileSync(req.files.file.path);
        file = file.toString().split('\n');
        file.forEach(x => {
            try {
                x = x.replace(/\t/g, ' ');
                x = x.replace(/     /g, ' ');
                x = x.replace(/    /g, ' ');
                x = x.replace(/   /g, ' ');
                x = x.replace(/  /g, ' ');
                x = x.split(' ');
                let tower = new db.towers();
                tower.name = x[3];
                tower.district = x[1];
                if (x[2].trim() == '中国移动')
                    tower.provider = 'China Mobile';
                else if (x[2].trim() == '中国联通')
                    tower.provider = 'China Unicom';
                else
                    tower.provider = 'China Telecom';
                tower.type = x[8];
                tower.height = x[9];
                tower.lon = x[5];
                tower.lat = x[6];
                tower.scene = x[4];
                tower.address = x[7];
                tower.status = req.body.status;
                if (res.locals.currentUser.city)
                    tower.city = res.locals.currentUser.city;
                else
                    tower.city = x[0];
                tower.save();
            } catch (e) {
                console.error(e);
            }
        });
        suggestCache = null;
        shareCache = null;
    }
    res.redirect('/tower');
});

router.get('/suggest', auth.authorize, function (req, res, next) {
    db.towers.find()
        .sort('district')
        .exec()
        .then(function (towers) {
            let ret = [];
            towers = towers.map(x => x.toObject());
            if (!suggestCache)
                buildSuggestCache();
            suggestCache.forEach(x => {
                towers.push(x);
            });
            res.render('tower/suggest', { title: '站址推荐', suggestions: suggestCache });
        })
        .then(null, next);
});

router.get('/export', auth.authorize, function (req, res, next) {
    let query = db.towers.find();
    if (req.query.city)
        query = query.where({ city: req.query.city });
    if (req.query.district)
        query = query.where({ district: req.query.district });
    if (req.query.type)
        query = query.where({ type: req.query.type });
    if (req.query.provider)
        query = query.where({ provider: new RegExp('.*' + req.query.provider + '.*') });
    if (req.query.name)
        query = query.where({ name: new RegExp('.*' + req.query.name + '.*') });
    if (req.query.status)
        query = query.where({ status: req.query.status });
    if (!res.locals.isMaster)
        query = query.where({ city: res.locals.currentUser.city });
    query
        .sort({ status: -1 })
        .exec()
        .then(function (towers) {
            let xls = '<table>';
            xls += '<tr><td>城市</td><td>地区</td><td>名称</td><td>地址</td><td>经度</td><td>纬度</td><td>产权</td><td>塔型</td><td>高度</td><td>场景</td><td>属性</td></tr>';
            towers.forEach(x => {
                xls += '<tr><td>' + x.city + '</td><td>' + x.district + '</td><td>' + x.name + '</td><td>' + x.address + '</td><td>' + x.lon + '</td><td>' + x.lat + '</td><td>' + x.provider + '</td><td>' + x.type + '</td><td>' + x.height + '</td><td>' + x.scene + '</td><td>' +  x.status + '</td></tr>';
            });
            xls += '</table>';
            res.setHeader('Content-disposition', 'attachment; filename=chinatower.xls');
            res.setHeader('Content-type', 'application/vnd.ms-excel');
            res.send(xls);
        })
        .then(null, next);
});

router.get('/exportshare', auth.authorize, function (req, res, next) {
    let xls = '<table>';
    xls += '<tr><td>铁塔1</td><td>地址</td><td>铁塔2</td><td>地址</td><td>距离（米）</td></tr>';
    shareCache.filter(x => x.begin.status != '预选' && x.end.status != '预选' && x.begin.status != '难点' && x.end.status != '难点').forEach(x => {
        xls += '<tr><td>' + x.begin.name + '(' + x.begin.status + ')' + '</td><td>' + x.begin.address + '</td><td>' + x.end.name + '(' + x.end.status + ')' + '</td><td>' + x.end.address + '</td><td>' + x.dis + '</td></tr>';
    });
    xls += '</table>';
    res.setHeader('Content-disposition', 'attachment; filename=chinatower.xls');
    res.setHeader('Content-type', 'application/vnd.ms-excel');
    res.send(xls);
});

router.get('/exportplan', auth.authorize, function (req, res, next) {
    let xls = '<table>';
    xls += '<tr><td>铁塔1</td><td>地址</td><td>铁塔2</td><td>地址</td><td>距离（米）</td></tr>';
    shareCache.filter(x => x.begin.status == '预选' || x.end.status == '预选').filter(x => x.begin.status != '难点' && x.end.status != '难点').forEach(x => {
        xls += '<tr><td>' + x.begin.name + '(' + x.begin.status + ')' + '</td><td>' + x.begin.address + '</td><td>' + x.end.name + '(' + x.end.status + ')' + '</td><td>' + x.end.address + '</td><td>' + x.dis + '</td></tr>';
    });
    xls += '</table>';
    res.setHeader('Content-disposition', 'attachment; filename=chinatower.xls');
    res.setHeader('Content-type', 'application/vnd.ms-excel');
    res.send(xls);
});

router.get('/exportsuggest', auth.authorize, function (req, res, next) {
    let xls = '<table>';
    xls += '<tr><td>经度</td><td>纬度</td><td>半径</td></tr>';
    suggestCache.forEach(x => {
        xls += '<tr><td>' + x.lon + '</td><td>' + x.lat + '</td><td>' + x.radius + '</td></tr>';
    });
    xls += '</table>';
    res.setHeader('Content-disposition', 'attachment; filename=chinatower.xls');
    res.setHeader('Content-type', 'application/vnd.ms-excel');
    res.send(xls);
});

router.get('/relation', auth.authorize, function (req, res, next) {
    if (!shareCache) buildShareCache();
    res.render('tower/relation', { title: '关联性分析', shares: shareCache.filter(x => x.begin.status == '难点' && x.end.status == '预选' || x.end.status == '难点' && x.begin.status == '预选') });
});

router.get('/exportrelation', auth.authorize, function (req, res, next) {
    let xls = '<table>';
    xls += '<tr><td>铁塔1</td><td>地址</td><td>铁塔2</td><td>地址</td><td>距离（米）</td></tr>';
    shareCache.filter(x => x.begin.status == '难点' && x.end.status == '预选' || x.end.status == '难点' && x.begin.status == '预选').forEach(x => {
        xls += '<tr><td>' + x.begin.name + '(' + x.begin.status + ')' + '</td><td>' + x.begin.address + '</td><td>' + x.end.name + '(' + x.end.status + ')' + '</td><td>' + x.end.address + '</td><td>' + x.dis + '</td></tr>';
    });
    xls += '</table>';
    res.setHeader('Content-disposition', 'attachment; filename=chinatower.xls');
    res.setHeader('Content-type', 'application/vnd.ms-excel');
    res.send(xls);
});

router.post('/modifypos', auth.authorize, function (req, res, next) {
    db.towers.update({ _id: req.body.id }, {
        lon: req.body.lon,
        lat: req.body.lat
    })
        .exec()
        .then(function (a) {
            console.log(a);
            res.send('true');
        })
        .then(null, next);
});

module.exports = router;
