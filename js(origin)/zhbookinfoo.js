console.log('zhbookinfoo.js');
chrome.runtime.onMessage.addListener(function(message, sender,sendResponse)
{
    if(message.action=="getzhBookInfoo")
    {
        var info={};
        if(document.getElementById('order_chapterlist_loading').style.display!="none")
        {
            info.s=0;//加载未完成
        }
        else
        {
            info.s=1;//加载已完成
            var ti=document.getElementsByClassName('order_chapter_inner tome_box');
            var ml=[];
            for(var i=0;i<ti.length;i++)
            {
                var te=ti[i];
                var mlt={};
                mlt.t=te.children[0].children[0].children[2].innerText;//卷名
                mlt.vtc=te.children[0].children[0].children[3].innerText.split('共')[1].split('章')[0]-1+1;//VIP章节数
                mlt.vtw=te.children[0].children[0].children[3].children[0].innerText-1+1;//VIP章节字数
                var mll=[];
                for(var j=0;j<te.children[1].childElementCount;j++)
                {
                    var t=te.children[1].children[j];
                    var mt={};
                    mt.buy=t.getAttribute('data-buy')-1+1;//是否已购买
                    mt.p=t.getAttribute('data-price')-1+1;//价格
                    mt.n=t.children[0].children[1].innerText;//章节名
                    mt.w=t.children[0].children[2].innerText-1+1;//字数
                    mll[j]=mt;
                }
                mlt.l=mll;
                ml[i]=mlt;
            }
            info.ml=ml;
            info.bn=document.getElementsByClassName('book-meta')[0].children[0].innerText;//书名
            info.an=document.getElementsByClassName('book-meta')[0].children[1].children[0].children[1].innerText;//作者名
        }
        sendResponse(info);
    }
});
