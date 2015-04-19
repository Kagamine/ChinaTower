'use strict'
let EarthRadiusKm = 6378.137;
function getDistance (p1Lat, p1Lng, p2Lat, p2Lng)
{
    let dLat1InRad = p1Lat * (Math.PI / 180);
    let dLong1InRad = p1Lng * (Math.PI / 180);
    let dLat2InRad = p2Lat * (Math.PI / 180);
    let dLong2InRad = p2Lng * (Math.PI / 180);
    let dLongitude = dLong2InRad - dLong1InRad;
    let dLatitude = dLat2InRad - dLat1InRad;
    let a = Math.pow(Math.sin(dLatitude / 2), 2) + Math.cos(dLat1InRad) * Math.cos(dLat2InRad) * Math.pow(Math.sin(dLongitude / 2), 2);
    let c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    let dDistance = EarthRadiusKm * c;
    return dDistance * 1000;
}

function solve (towers) {
    let ret = [];
    for (let i = 0; i < towers.length; i ++) {
        for (let j = i + 1; j < towers.length; j ++) {
            let dis = getDistance(towers[i].lat, towers[i].lon, towers[j].lat, towers[j].lon);
            let flag = false;
            if (towers[i].status == '预选' || towers[j].status == '预选') {
                switch(towers[j].scene)
                {
                    case '郊区':
                        if (dis < settings.plan.suburb)
                            flag = true;
                        break;
                    case '密集城区':
                        if (dis < settings.plan.crowded)
                            flag = true;
                        break;
                    case '农村':
                        if (dis < settings.plan.village)
                            flag = true;
                        break;
                    default:
                        if (dis < settings.plan.city)
                            flag = true;
                        break;
                }
            } else {
                switch(towers[j].scene)
                {
                    case '郊区':
                        if (dis < settings.share.suburb)
                            flag = true;
                        break;
                    case '密集城区':
                        if (dis < settings.share.crowded)
                            flag = true;
                        break;
                    case '农村':
                        if (dis < settings.share.village)
                            flag = true;
                        break;
                    default:
                        if (dis < settings.share.city)
                            flag = true;
                        break;
                }
            }
            if (flag) {
                ret.push({ lon: towers[i].lon, lat: towers[i].lat, dis: getDistance(towers[i].lat, towers[i].lon, towers[j].lat, towers[j].lon), begin: { lat: towers[i].lat, lon: towers[i].lon, name: towers[i].name, type: towers[i].type, virtual: towers[i].virtual }, end: { lat: towers[j].lat, lon: towers[j].lon, name: towers[j].name, type: towers[j].type, status: towers[j].status } });
            }
        }
    }
    return ret;
}

module.exports = solve;