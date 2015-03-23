var mongodb = require('../models/mongodb');
var Schema = mongodb.mongoose.Schema;

var seriesSchema = new Schema({
    title: String,
    time: {
        type: Date,
        index: true
    }
});

var series = mongodb.mongoose.model('serieses', seriesSchema);
module.exports = series;