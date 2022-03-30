console.log('options.js');
function s(id,value)//设置节点属性
{
    document.getElementById(id).value=value;
}
function g(id)//获取节点属性(boolean)
{
    return document.getElementById(id).value=='true';
}
function a(){//读取信息
chrome.storage.sync.get(function(data)
{
    console.log(data);
    s('autosave',data.autosave);
    s('snbuy',data.snbuy);
    s('tnbuy',data.tnbuy);
    s('strip', data.strip);
});
}
function c()//重置选项
{
    s('autosave',false);
    s('snbuy',false);
    s('tnbuy',true);
    s('strip', false);
}
function b()
{
    var tem={};
    document.getElementById('s').disabled=true;
    var mx=chrome.runtime.getManifest();
    tem.autosave=g('autosave');
    tem.snbuy=g('snbuy');
    tem.tnbuy=g('tnbuy');
    tem.strip = g('strip');
    tem.version=mx.version;
    chrome.storage.sync.set(tem,function()
    {
        document.getElementById('s').disabled=false;
    });
}
a();
document.addEventListener('DOMContentLoaded',function()
{
    document.getElementById('a').addEventListener('click',a);
    document.getElementById('c').addEventListener('click',c);
    document.getElementById('s').addEventListener('click',b);
});
