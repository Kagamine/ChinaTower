function getcolor(now)
{
    var TD=now.signal;
    if(TD>=-65&&TD<=0)return 0;
    if(TD>=-75&&TD<=-65)return 1;
    if(TD>=-140&&TD<=-75)return 2;
    return -1;
}
function cal(a,b){
    return Math.atan2(a.lat-b.lat,a.lon-b.lon);
}
function sqr(a){
    return a*a;
}
function dis2(a,b){
    return sqr(a.lat-b.lat)+sqr(a.lon-b.lon);
}
function acu(a,b,c){
    if(dis2(a,b)+dis2(b,c)>dis2(a,c))return 1;
    return 0;
}
function solve(t)
{
    var ans=[];
    var L=dis2(t[0],t[50]);
    var now=0,last=0,color=getcolor(t[now]);
    for(var i=1;i<t.length;i++){
        t[i] = t[i].toObject();
        if(getcolor(t[i])!=color)
        {
            if(now!=last)ans.push({start: t[now], end: t[last], color: color});
            now = last;
            last = i;
            color = getcolor(t[i]);
            if(dis2(t[now],t[i])>L)now=i;
        }
        else
        {
            if(Math.abs(cal(t[now],t[last])-cal(t[now],t[i]))>0.35||dis2(t[now],t[last])>L)
            {
                if(now!=last)ans.push({start:t[now],end:t[last],color:color});
                now=last;last=i;color=getcolor(t[i]);
                if(dis2(t[now],t[i])>L)now=i;
            }
        }
        last=i;
        while(dis2(t[now],t[last])>2*L)now++;
    }
    if(now!=last)ans.push({start:{ lon: t[now].lon, lat: t[now].lat },end:{ lon: t[last].lon, lat: t[last].lat },color:color});
    return ans;
}
function pre(t)
{
    var ans=[];
    for(var i=0;i<t.length;i++)
    {
        while(ans.length>1)
        {
            if(acu(ans[ans.length-2],ans[ans.length-1],t[i]))ans.pop();
            else break;
        }
        ans.push(t[i]);
    }
    return ans;
}
module.exports = function (t)
{
    var ans=[];
    t=pre(t);
    ans=solve(t);
    return ans;
}