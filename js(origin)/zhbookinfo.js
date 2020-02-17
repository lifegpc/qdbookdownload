console.log('zhbookinfo.js');
chrome.runtime.onMessage.addListener(function(message, sender,sendResponse)
{
    if(message.action=="getzhBookInfo")
    {
        var info={};
        info.bn=document.body.getAttribute('bookname');//书名
        info.bid=document.body.getAttribute('bookid')-1+1;//书籍ID
        var ci=document.getElementsByClassName('book-author')[0];
        info.an=ci.children[1].children[0].innerText;//作家名
        ci=document.getElementsByClassName('book-label')[0];
        var tag=[];
        var m=0
        for(var i=0;i<ci.childElementCount;i++)
        {
            if(ci.children[i].constructor.name=="HTMLAnchorElement")
            {
                var tal={};
                tal.l=ci.children[i].className;
                tal.c=ci.children[i].innerText;
                tag[m]=tal;
                m++;
            }
            else
            {
                var cq=ci.children[i];
                for(var j=0;j<cq.childElementCount;j++)
                {
                    var tal={};
                    tal.l="o";
                    tal.c=cq.children[j].innerText;
                    tag[m]=tal;
                    m++
                }
            }
        }
        info.tag=tag;//标签
        info.in=document.getElementsByClassName('book-dec Jbook-dec')[0].children[0].innerText;//简介
        sendResponse(info);
    }
    else if(message.action=="getzhBookInfooh")
    {
        sendResponse(document.getElementsByClassName('orderlink')[0].href);
    }
});
