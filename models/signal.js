var mongodb = require('../models/mongodb');
var Schema = mongodb.mongoose.Schema;

var signalSchema = new Schema({
    lat: String,
    lon: String,
    signal: Number,
    order: {
        type: Number,
        index: true
    },
    series: {
        type: Schema.Types.ObjectId,
        ref: 'serieses',
        index: true
    }
});

var signal = mongodb.mongoose.model('signal', signalSchema);
module.exports = signal;