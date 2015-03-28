var mongodb = require('../models/mongodb');
var Schema = mongodb.mongoose.Schema;

var rxlevPointSchema = new Schema({
    lat: String,
    lon: String
});

var rxlevLineSchema = new Schema({
    points: [rxlevPointSchema],
    color: Number,
    series: {
        type: Schema.Types.ObjectId,
        ref: 'serieses',
        index: true
    }
});

var rxlevLine = mongodb.mongoose.model('rxlevLines', rxlevLineSchema);
module.exports = rxlevLine;