var mongodb = require('./mongodb');
var fs = require('fs');
var Grid = require('gridfs-stream');

var Schema = mongodb.mongoose.Schema;
var conn = mongodb.mongoose.connection;
Grid.mongo = mongodb.mongoose.mongo;

var db = {};
db.gfs = Grid(conn.db);
db.towers = require('./tower');
db.rxlevLines = require('./rxlevLine');
db.users = require('./user');
db.serieses = require('./series');
db.Schema = Schema;
db.fs = fs;
db.mongoose = mongodb.mongoose;

module.exports = db;