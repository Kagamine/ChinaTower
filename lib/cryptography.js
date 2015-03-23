var crypto = require('crypto');
var _crypto = {};

_crypto.sha256 = function (str) {
    return crypto.createHash('sha256').update(str).digest('hex');
};

module.exports = _crypto;