console.log('free.js');
chrome.runtime.onMessage.addListener(function(message, sender,sendResponse)
{
    if(message.action=="getNowFreeBook")
    {
        var info={};
        var ci=document.getElementsByClassName('book-img-text')[0].children[0];
        var list=[];
        for(var i=0;i<ci.childElementCount;i++)
        {
            var bo={};
            var cm=ci.children[i].children[1];
            bo.bn=cm.children[0].innerText;//书名
            bo.h=cm.children[0].children[0].href;//info链接
            bo.in=cm.children[2].innerText;//介绍
            cm=cm.children[1];
            bo.an=cm.children[1].innerText;//作者名
            bo.fl=cm.children[3].innerText;//分类
            bo.s=cm.children[5].innerText;//小说状态
            cm=ci.children[i].children[2];
            bo.p=cm.children[0].children[1].innerText.split('¥')[1]-1+1;//价格（人民币）
            list[i]=bo;
        }
        info.l=list;
        sendResponse(info);
    }
});
