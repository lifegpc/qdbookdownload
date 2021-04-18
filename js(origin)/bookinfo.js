console.log('bookinfo.js');
chrome.runtime.onMessage.addListener(function(message, sender,sendResponse)
{
    if(message.action=="getBookInfo")
    {
        var info={};
        if(document.getElementsByClassName('error-text fl').length)
        {
            info.s=1;//404或其他错误
            sendResponse(info);
            return;
        }
        else
        {
            info.s=0;//无错误
        }
        var ci=document.getElementsByTagName('script')
        for(var i=0;i<ci.length;i++)
        {
            if(ci[i].innerHTML.indexOf('g_data')>-1)
            {
                info.g_data = eval("(function(){" + ci[i].innerHTML + ";return g_data;})()"); // 全局数据
                break;
            }
        }
        ci=document.getElementsByClassName('book-info')[0];
        info.bn=ci.firstElementChild.firstElementChild.innerText;//书名
        var cq=ci.children[1];
        var tag=[];
        for(var i=0;i<cq.childElementCount;i++)
        {
            var tal={};
            tal.c=cq.children[i].innerText;
            tal.l=cq.children[i].className;
            tag[i]=tal;
        }
        info.tag=tag;//标签
        info.in=ci.children[2].innerText;//简介
        ci=document.getElementsByClassName('book-info-detail')[0];
        cq=document.getElementsByClassName('book-content-wrap cf hidden')[0];
        if(cq==null)info.ind=ci.children[1].children[0].innerText.split('\n');//详细简介
        else
        {
            var tl=ci.children[1].children[0].innerText.split('\n')[2].split('　　');
            var ind=[];
            for(var i=1;i<tl.length;i++)ind[i-1]='　　'+tl[i];
            info.ind=ind;
        }
        var temp=ci.children[2].children[0].children[0].children[1].children[0];
        var atag=[]
        for(var i=0;i<temp.childElementCount;i++)atag[i]=temp.children[i].innerText;
        info.atag=atag;//作者自定义标签
        var cb=document.getElementsByClassName('volume-wrap');
        cq=document.getElementsByClassName('catalog-content-wrap')[0];
        var cq2=document.getElementsByClassName('catalog-content-wrap hidden')[0];
        var ml=[];
        var m=0;
        function getchatperlist(t,vip)
        {
            var l=[];
            for(var j=0;j<t.childElementCount;j++)
            {
                var mll={};
                mll.n=t.children[j].children[0].innerText;//章节名
                mll.h=t.children[j].children[0].href;//链接
                if(t.children[j].childElementCount!=2&&vip==1)mll.buy=1;else mll.buy=0;//是否购买
                var temp=t.children[j].children[0].title.split("：");
                mll.w=temp[2]-1+1;//字数
                temp=temp[1].split(" ");
                mll.u=temp[0]+" "+temp[1];//上传时间
                l[j]=mll;
            }
            return l;
        }
        for(var k=0;k<cb.length;k++)
        {
            ci=cb[k];
            for(var i=0;i<ci.childElementCount;i++)
            {
                var mlt={};
                if(cq.style.display!='none'&&cq2==null)
                {
                    var temp=ci.children[i].children[1].innerText;
                    var te=1;
                    if(ci.children[i].children[1].children[0].constructor.name=='HTMLAnchorElement')
                    {
                        temp=temp.split('\n')[1];
                        te=2;
                    }
                    mlt.t=temp.split('·')[0];//卷名
                    mlt.tc=temp.split('·')[1].split('共')[1].split('章')[0]-1+1;//总章数
                    // mlt.tw=temp.split('·')[1].split('共')[2].split('字')[0]-1+1;//总字数
                    if(ci.children[i].children[1].children[te].className=="vip")mlt.vip=1;else mlt.vip=0;//是否为VIP卷
                    var t=ci.children[i].children[2];
                    mlt.l=getchatperlist(t,mlt.vip);//章节列表
                }
                else
                {
                    /**@type {String}*/
                    var temp = ci.children[i].children[1].innerHTML;
                    mlt.t = temp.match(/([^ ]+)<i>/)[1];  // 卷名
                    mlt.tc = temp.match(/共([0-9]+)章/)[1] - 1 + 1;  //总章数
                    mlt.vip = ci.children[i].children[1].children[1].className == "vip" ? 1 : 0;  //是否为VIP卷
                    // mlt.tw=temp[1].split('共')[1].split('字')[0]-1+1;//总字数
                    var t=ci.children[i].children[2];
                    mlt.l=getchatperlist(t,mlt.vip);//章节列表
                }
                ml[m]=mlt;
                m=m+1;
            }
        }
        info.ml=ml;//目录
        let img = document.getElementById('bookImg');
        if (img != null) {
            info.cover = img.children[0].src;
        }
        sendResponse(info);
    }
});
