console.log('zhbookinfom.js')
chrome.runtime.onMessage.addListener(function(message, sender,sendResponse)
{
    function getm()//获取目录列表
    {
        var list=[];
        var ci=document.getElementsByClassName('volume-list')[0];
        for(var i=0;i<ci.childElementCount;i++)
        {
            var mlt={};
            mlt.t=ci.children[i].children[0].innerText.split('\n')[1].split('共')[0];//卷名
            mlt.tc=ci.children[i].children[0].innerText.split('\n')[1].split('共')[1].split('章')[0]-1+1;//总章数
            mlt.tw=ci.children[i].children[0].innerText.split('\n')[1].split('共')[2].split('字')[0]-1+1;//总字数
            if(ci.children[i].children[0].className=="volume ")mlt.vip=0;else mlt.vip=1;//卷是否为VIP卷
            var cq=ci.children[i].children[1];
            var l=[];
            for(var j=0;j<cq.childElementCount;j++)
            {
                var mll={};
                if(cq.children[j].className=="vip col-4")mll.vip=1;else mll.vip=0;//是否为VIP章节
                mll.n=cq.children[j].children[0].innerText;//章节名
                mll.h=cq.children[j].children[0].href;//链接
                if(mll.n.indexOf('"')>-1)//处理章节名中有"导致的BUG（纵横快点出来背锅，转义都不会🐴艹
                {
                    mll.w=cq.children[j].innerHTML.split('字数：')[1].split("=")[0]-1+1;//字数
                    var temp=cq.children[j].innerHTML.split('更新时间：')[1].split('="" ');
                }
                else
                {
                    mll.w=cq.children[j].children[0].title.split("字数：")[1].split(" ")[0]-1+1;//字数
                    var temp=cq.children[j].innerHTML.split("更新时间：")[1].split(" ");
                }
                mll.u=temp[0]+" "+temp[1];//上传时间
                l[j]=mll;
            }
            mlt.l=l;
            list[i]=mlt;
        }
        return list;
    }
    if(message.action=="getzhBookInfom")
    {
        var info={};
        info.ml=getm();//目录
        info.bn=document.getElementsByTagName('h1')[0].innerText;//书名
        info.an=document.getElementsByClassName('book-meta')[0].children[1].children[0].children[1].innerText;//作者名
        sendResponse(info);
    }
    if(message.action=="getzhBookInfoom")
    {
        sendResponse({ml:getm()});
    }
});
