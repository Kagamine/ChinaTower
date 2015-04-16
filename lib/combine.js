'use strict'
module.exports = function (towers, left, right, top, bottom) {
    if (towers.length <= 529)
        return towers;
    let result = [];
    for (let i = parseFloat(left); i <= parseFloat(right); i += (parseFloat(right) - parseFloat(left)) / 23)
    {
        for (let j = parseFloat(bottom); j <= parseFloat(top); j += (parseFloat(top) - parseFloat(bottom)) / 23)
        {
            let tmp = towers.filter(x => parseFloat(x.lon) >= i && parseFloat(x.lon) <= parseFloat(i) + (right - left) / 23 && parseFloat(x.lat) >= j && parseFloat(x.lat) <= parseFloat(j) + (top - bottom) / 23);
            if (tmp.length > 0)
                result.push(tmp[0]);
        }
    }
    console.log(result.length);
    return result;
};