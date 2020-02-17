console.log('zhremovead.js')
function clearad(){
    var a=document.getElementById('index_right_bottom_piclnk');
    if(a!=null)a.remove();else setTimeout(clearad,100);
}//移除广告区域
function clearad2()
{
    var a=document.getElementsByClassName('com-recbox');
    if(a.length!=0)
    {
        for(var i=0;i<a.length;i++)
        {
            a[i].remove();
        }
    }
    else setTimeout(clearad2,100);
}
setTimeout(clearad,100);
setTimeout(clearad2,100);
