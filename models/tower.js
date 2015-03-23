var mongodb = require('../models/mongodb');
var Schema = mongodb.mongoose.Schema;

var towerSchema = new Schema({
    lat: String,
    lon: String,
    district: {
        type: String,
        index: true
    },
    name: String,
    type: {
        type: String,
        enum: ['B', 'T', 'Z'],
        index: true
    },
    provider: {
        type: String,
        enum: ['China Telecom', 'China Mobile', 'China Unicom'],
        index: true
    },
    height: {
        type: Number,
        default: 0
    },
    picture: {
        type: Schema.Types.ObjectId,
        ref: 'fs.files'
    }
});

towerSchema.virtual('providerDisplay').get(function () {
    if (this.provider == 'China Moblie')
        return '中国移动';
    else if (this.provider == 'China Telecom')
        return '中国电信';
    else
        return '中国移动';
});

var tower = mongodb.mongoose.model('tower', towerSchema);
module.exports = tower;