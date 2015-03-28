var L;
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
function cut(t,l,r){
    var mx=0,c=l;
    for(var i=l+1;i<r;i++)
        if(Math.abs(cal(t[l],t[i])-cal(t[i],t[r]))>mx)
        {
            mx=Math.abs(cal(t[l],t[i])-cal(t[i],t[r]));
            c=i;
        }
    if(mx<0.35)return l;
    else return c;
}
function solve(t){
    var ans=[];
    var now=0,last=0,color=getcolor(t[now]);
    for(var i=1;i<t.length;i++){
        if(Math.abs(cal(t[now],t[last])-cal(t[now],t[i]))>0.2||dis2(t[now],t[last])>L||getcolor(t[i])!=color)
        {
            if(now<last-1)
            {
                var c=cut(t,now,last);
                if(c!=now)ans.push({start:t[now],end:t[c],color:color});
                ans.push({start:t[c],end:t[last],color:color});
                now=last;last=i;color=getcolor(t[i]);
            }
            if(dis2(t[now],t[i])>L)now=i;
        }
        last=i;
        while(dis2(t[now],t[last])>2*L)now++;
    }
    if(now!=last)ans.push({start:{lon:t[now].lon,lat:t[now].lat},end:{lon:t[last].lon,lat:t[last].lat},color:color});
    return ans;
}
function equ(a,b)
{
    if(dis2(a,b)<=L/150)
        return 1;
    return 0;
}
function equ2(a,b)
{
    if(dis2(a,b)<=L)
        return 1;
    return 0;
}
function pre(t){
    var ans=[];
    for(var i=0;i<t.length;i++)
    {
        if(ans.length)
            if(equ(t[i],ans[ans.length-1]))continue;
        ans.push(t[i]);
    }
    return ans;
}
function merge(t){
    var ans=[],now,color;
    now=cal(t[0].start,t[0].end);
    ans.push(t[0]);
    for(var i=1;i<t.length;i++)
        if(Math.abs(cal(t[i].start,t[i].end)-now)<0.3&&!ans[ans.length-1].color&&(!t[i].color||dis2(t[i].start,t[i].end)<L/10)&&t[i].start==ans[ans.length-1].end)
            ans[ans.length-1].end=t[i].end;
        else
        {
            ans.push(t[i]);
            now=cal(t[i].start,t[i].end);
        }
    return ans;
}
function trans(t)
{
    var point=[],ans=[];
    point.push({lon:t[0].start.lon,lat:t[0].start.lat});
    point.push({lon:t[0].end.lon,lat:t[0].end.lat});
    var color=t[0].color;
    for(var i=0;i<t.length;i++)
    {
        if(equ2(t[i].start,point[point.length-1])&&color==t[i].color)
            point.push({lat:t[i].end.lat,lon:t[i].end.lon});
        else
        {
            ans.push({points:point,color:color});
            point=[];
            color=t[i].color;
            point.push({lon:t[i].start.lon,lat:t[i].start.lat});
            point.push({lon:t[i].end.lon,lat:t[i].end.lat});
        }
    }
    ans.push({points:point,color:color});
    return ans;
}
module.exports=function(t)
{
    var ans=[];
    L=dis2(t[0],t[20]);
    t=pre(t);
    ans=solve(t);
    ans=merge(ans);
    console.log(ans.length + '条线段');
    return trans(ans);
}