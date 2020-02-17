console.log('zhchapter.js');
chrome.runtime.onMessage.addListener(function(message, sender,sendResponse)
{
if(message.action=='getzhChapter')
{
    var info={}
    var ci=document.getElementsByClassName('title_txtbox');
    var cq=ci.item(0);
    info.n=cq.innerText;//章节名
    ci=document.getElementsByClassName('bookinfo')[0];
    info.w=ci.children[1].innerText-1+1;//字数
    info.u=ci.children[2].innerText;//上传时间
    info.an=ci.children[0].innerText;//作者名
    info.cid=document.body.getAttribute('chapterid')-1+1;//当前章节ID
    info.pcid=document.body.getAttribute('lastchapterid')-1+1;//上一章节ID
    info.ncid=document.body.getAttribute('nextchapterid')-1+1;//下一章节ID
    info.bn=document.body.getAttribute('bookname');//书名
    info.bid=document.body.getAttribute('bookid')-1+1;//书ID
    info.cl=document.body.getAttribute('chapterlevel')-1+1;//章节VIP情况
    ci=document.getElementsByClassName('content')[0].children;
    var c=[];
    for(var i=0;i<ci.length;i++)c[i]=ci[i].innerText;
    info.c=c;//内容
    if(info.cl==1)
    {
        ci=document.getElementsByClassName('reader_order');
        if(ci.length<1)info.buy=1;//已购买
        else
        {
            info.buy=0;//未购买
            ci=ci[0];
            info.cmo=ci.children[2].firstElementChild.firstElementChild.lastElementChild.innerText.split('：')[1].split(' ')[0]-1+1;//单章金额
            info.bl=ci.children[0].firstElementChild.firstElementChild.innerText-1+1;//账户余额
        }
    }
    sendResponse(info);
}
});
