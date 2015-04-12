var mongodb = require('../models/mongodb');
var Schema = mongodb.mongoose.Schema;

var towerSchema = new Schema({
    lat: {
        type: Number,
        index: true
    },
    lon: {
        type: Number,
        index: true
    },
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
    },
    url: String,
    scene: {
        type: String,
        index: true,
        enum: ['郊区', '密集城区', '农村', '一般城区'],
        default: '一般城区'
    },
    virtual: {
        type: Boolean,
        index: true,
        default: false
    },
    address: String,
    form: {
        selector: String,
        partner: String,
        time: Date,
        reason: {
            type: String,
            enum: ['覆盖', '容量', '质量', '投诉', '业务拓展', '其他']
        },
        method: {
            type: String,
            enum: ['新建独用', '新建共用', '新建共享']
        },
        pcRoom: {
            type: String,
            enum: ['自建砖混机房', '自建活动机房', 'MINI机柜', '租赁机房', '自有机房', '共享其他运营商机房', '一体化集装箱机房', '拉远无机房']
        },
        tower: {
            type: String,
            enum: ['路灯杆塔', '双轮景观塔', '灯杆景观塔', '三管塔', '插接式单管塔', '角钢塔', '落地拉线塔', '屋顶拉线塔', '增高架', '支撑杆', '抱杆', '仿生树', '其他']
        },
        wire: Number,
        electric: {
            type: String,
            enum: ['直供电', '转供电']
        },
        wireHeight: String,
        owner: String,
        ownerContact: String,
        photos: [{ title: String, file: Schema.Types.ObjectId }]
    }
}, {
    toObject: {
        virtuals: true
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

towerSchema.virtual('radius').get(function () {
    if (this.provider == 'China Unicom')
    {
        if (this.scene == '郊区')
        {
            if (this.height <= 30)
                return 1.514623172;
            else if (this.height <= 35)
                return 1.61872922;
            else if (this.height <= 50)
                return 1.900409039;
            else if (this.height <= 60)
                return 2.070636726;
            else
                return 2.384042883;
        }
        else if (this.scene == '密集城区')
        {
            if (this.height <= 25)
                return 0.442876862;
            else if (this.height <= 30)
                return 0.470046366;
            else if (this.height <= 50)
                return 0.560813211;
            else if (this.height <= 60)
                return 0.599526502;
            else
                return 0.669016783;
        }
        else if (this.scene == '农村')
        {
            if (this.height <= 30)
                return 2.736689022;
            else if (this.height <= 40)
                return 3.146361708;
            else if (this.height <= 50)
                return 3.522269387;
            else if (this.height <= 60)
                return 3.874885855;
            else
                return 4.532477953;
        }
        else
        {
            if (this.height <= 30)
                return 0.644554707;
            else if (this.height <= 50)
                return 0.779537827;
            else if (this.height <= 60)
                return 0.837641066;
            else
                return 0.942651847;
        }
    }
    else if (this.provider == 'China Telecom')
    {
        if (this.scene == '郊区')
        {
            if (this.height <= 30)
                return 1.380490728;
            else if (this.height <= 35)
                return 1.473653784;
            else if (this.height <= 50)
                return 1.725214998;
            else if (this.height <= 60)
                return 1.876916407;
            else
                return 2.155652584;
        }
        else if (this.scene == '密集城区')
        {
            if (this.height <= 25)
                return 0.404199918;
            else if (this.height <= 30)
                return 0.428419862;
            else if (this.height <= 50)
                return 0.509113219;
            else if (this.height <= 60)
                return 0.54343725;
            else
                return 0.604925258;
        }
        else if (this.scene == '农村')
        {
            if (this.height <= 30)
                return 2.594106333;
            else if (this.height <= 40)
                return 2.978641737;
            else if (this.height <= 50)
                return 3.331079795
            else if (this.height <= 60)
                return 3.661367795;
            else
                return 4.276604399;
        }
        else
        {
            if (this.height <= 30)
                return 0.587474042;
            else if (this.height <= 50)
                return 0.70767415;
            else if (this.height <= 60)
                return 0.759274787;
            else
                return 0.852346199;
        }
    }
    else
    {
        if (this.scene == '郊区')
        {
            if (this.height <= 30)
                return 1.063049718;
            else if (this.height <= 35)
                return 1.131058501;
            else if (this.height <= 50)
                return 1.313652708;
            else if (this.height <= 60)
                return 1.423102593;
            else
                return 1.623069472;
        }
        else if (this.scene == '密集城区')
        {
            if (this.height <= 25)
                return 0.292944787;
            else if (this.height <= 30)
                return 0.309029995;
            else if (this.height <= 50)
                return 0.362110538;
            else if (this.height <= 60)
                return 0.384475178;
            else
                return 0.424256924;
        }
        else if (this.scene == '农村')
        {
            if (this.height <= 30)
                return 2.050517472;
            else if (this.height <= 40)
                return 2.341342638;
            else if (this.height <= 50)
                return 2.60655322;
            else if (this.height <= 60)
                return 2.854063207;
            else
                return 3.312759183;
        }
        else
        {
            if (this.height <= 30)
                return 0.423759766;
            else if (this.height <= 50)
                return 0.503338467;
            else if (this.height <= 60)
                return 0.537177585;
            else
                return 0.597782572;
        }
    }
});

var tower = mongodb.mongoose.model('tower', towerSchema);
module.exports = tower;