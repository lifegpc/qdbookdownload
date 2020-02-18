console.log('book.js')
chrome.runtime.onMessage.addListener(function(message, sender,sendResponse)
{
    if(message.action=="getBookList")
    {
        var info={};
        if(document.getElementById('img-text').classList.length==2)
        {
            info.c=1;//图文模式
            /**@type {HTMLUListElement} 所有书籍列表*/
            var ci=document.getElementsByClassName('all-img-list cf')[0];
            var list=[];
            for(var i=0;i<ci.childElementCount;i++)
            {
                /**@type {HTMLDivElement} 书籍信息部分*/
                var cq=ci.children[i].children[1];
                /**书籍信息*/
                var tem={};
                /**@type {string} 书名*/
                tem.bn=cq.children[0].innerText;
                /**@type {string} 书籍链接*/
                tem.h=cq.children[0].children[0].href;
                /**@type {string} 书籍介绍*/
                tem.in=cq.children[2].innerText;
                cq=cq.children[1];
                /**@type {string} 作者名*/
                tem.an=cq.children[1].innerText;
                /**@type {Array<string>} 分类*/
                tem.fl=[cq.children[3].innerText,cq.children[5].innerText];
                if(cq.childElementCount==10)tem.fl[2]=cq.children[9].innerText;
                /**@type {string} 小说状态*/
                tem.s=cq.children[7].innerText;
                list[i]=tem;
            }
            info.l=list;
        }
        else
        {
            info.c=0;//仅文字模式
            /**@type {HTMLTableSectionElement} 所有书籍列表*/
            var ci2=document.getElementsByClassName('rank-table-list all')[0].tBodies[0];
            var list2=[];
            for(var i=0;i<ci2.childElementCount;i++)
            {
                /**@type {HTMLTableRowElement} 一本书信息行*/
                var cb=ci2.children[i];
                /**书籍信息*/
                var tem2={};
                /**@type {string} 书名*/
                tem2.bn=cb.children[1].innerText;
                /**@type {string} 书籍链接*/
                tem2.h=cb.children[1].children[0].href;
                /**@type {string} 作者名*/
                tem2.an=cb.children[4].innerText;
                /**@type {Array<string>} 分类*/
                tem2.fl=[cb.children[0].children[0].innerText.substring(1),cb.children[0].children[2].innerText.split("」")[0]];
                /**@type {string} 最新章节名*/
                tem2.cn=cb.children[2].innerText;
                /**@type {string} 最新章节链接*/
                tem2.cp=cb.children[2].children[0].href;
                /**@type {string} 最新章节更新时间*/
                tem2.ct=cb.children[5].innerText;
                list2[i]=tem2;
            }
            info.l=list2;
        }
        sendResponse(info);
    }
});
