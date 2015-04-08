'use strict'
function check(t,ans,lat,lon){
    var mn=getDistance(lat,lon,t[0].lat,t[0].lon),R=0;
    for(var i=0;i<ans.size();i++)
        if(getDistance(lat,lon,ans[i].lat,ans[i].lon)<=ans[i].radius)
            return 0;
    for(var i=0;i<t.size();i++)
    {
        var dis=getDistance(lat,lon,t[i].lat,t[i].lon);
        if(dis<=t[i].radius)
            return 0;
        else if(dis<mn)
            mn=dis,R=t[i].radius;
    }
    return R;
}

module.exports = function (t){
    var ans=[],x0,y0,x1,y1;
    x0=x1=t[0].lat;y0=y1=t[0].lon;
    var dis=Math.PI/180/EarthRadiusKm*20;
    for(var i=x0;i<=x1;i+=dis)
        for(var j=y0;j<=y1;j+=dis){
            var rad=check(t,ans,i,j);
            if(rad!=0)
                ans.push({lat:i,lon:j,radius:rad});
        }
    return ans;
};