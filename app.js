var os = require('os');
var fs = require('fs');
var _ = GLOBAL._ = require('underscore');
var express = require('express');
var expressLayouts = require('express-ejs-layouts');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var session = require('express-session');
var multer = require('multer');
var auth = GLOBAL.auth = require('./middlewares/auth')
var moment = GLOBAL.moment = require('moment');

var home = require('./controllers/home');
var login = require('./controllers/login');
var logout = require('./controllers/logout');
var tower = require('./controllers/tower');
var map = require('./controllers/map');
var file = require('./controllers/file');
var user = require('./controllers/user');
var signal = require('./controllers/signal');
var pano = require('./controllers/pano');
var statistics = require('./controllers/statistics');
var setting = require('./controllers/setting');

var app = express();
app.use(expressLayouts);

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

var db = GLOBAL.db = require('./models');
// uncomment after placing your favicon in /public
//app.use(favicon(__dirname + '/public/favicon.ico'));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(multer({ dest: os.tmpdir() }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.set('layout', 'layout');
app.use(session({ secret: 'china-tower', resave: false, saveUninitialized: true }));

app.use(function (req, res, next) {
    res.locals.res = res;
    res.locals.req = req;
    res.locals.moment = moment;
    next();
});

var settings = GLOBAL.settings = JSON.parse(fs.readFileSync(__dirname + '/config.json'));

app.use('/', home);
app.use('/login', login);
app.use('/logout', logout);
app.use('/tower', tower);
app.use('/map', map);
app.use('/file', file);
app.use('/user', user);
app.use('/signal', signal);
app.use('/pano', pano);
app.use('/statistics', statistics);
app.use('/setting', setting);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    app.use(function(err, req, res, next) {
        res.status(err.status || 500);
        res.locals.title = '错误';
        res.render('error', {
            message: err.message,
            error: err,
            layout: false
        });
    });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: {},
        title: '错误',
        layout: false
    });
});


module.exports = app;
