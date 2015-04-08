'use strict'
let EarthRadiusKm = 6378.137;
function mul(x1,y1,x2,y2)
{
    return x1*y2-x2*y1;
}
function check_line(t,a,b){
    for(let i=0;i<t.length;i++)
        if(mul(b.lat-a.lat,b.lon-a.lon,b.lat-t[i].lat,b.lon-t[i].lon)<0)return 0;
    return 1;
}
function incon(l,lat,lon)
{
    for(let i=0;i<l.length;i++)
        if(mul(l[i].b.lat-l[i].a.lat,l[i].b.lon-l[i].a.lon,l[i].b.lat-lat,l[i].b.lon-lon)<0)return 0;
    return 1;
}
function conclo(t){
    let line=[];
    for(let i=0;i<t.length;i++)
        for(let j=0;j<t.length;j++)
            if(i!=j&&check_line(t,t[i],t[j]))line.push({a:t[i],b:t[j]});
    return line;
}
function check(l,t,ans,lat,lon) {
    //return 1;
    let mn = getDistance(lat, lon, t[0].lat, t[0].lon), R = t[0].radius;
    for (let i = 0; i < ans.length; i++)
        if (getDistance(lat, lon, ans[i].lat, ans[i].lon) <= ans[i].radius * 1000)
            return 0;
    for (let i = 0; i < t.length; i++) {
        let dis = getDistance(lat, lon, t[i].lat, t[i].lon);
        if (dis <= t[i].radius * 1000)
            return 0;
        else if (dis < mn)
            mn = dis, R = t[i].radius;
    }
    if (mn > 500 || !incon(l, lat, lon))return 0;
    return R;
}
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
function min (a, b)
{
    return a < b ? a : b;
}
function max (a, b)
{
    if(a>b)return a;
    return b;
}
module.exports = function (t){
    let l=conclo(t);
    let ans=[],x0,y0,x1,y1;
    x0=x1=t[0].lat;y0=y1=t[0].lon;
    for(let i=1;i<t.length;i++) {
        x0 = min(x0, parseFloat(t[i].lat));
        y0 = min(y0, parseFloat(t[i].lon));
        x1 = max(x1, parseFloat(t[i].lat));
        y1 = max(y1, parseFloat(t[i].lon));
    }
    let dis=(x1-x0)/25;
    for(let i=parseFloat(x0);i<=x1;i+=dis)
        for(let j=parseFloat(y0);j<=y1;j+=dis){
            let rad=check(l,t,ans,i,j);
            if(rad!=0)
                ans.push({lat:i,lon:j,radius:rad});
        }
    return ans;
}