console.log('chapter.js');
chrome.runtime.onMessage.addListener(function (message, sender, sendResponse)//响应chrome.tabs.sendMessage
{
    if (message.action == 'getCheapter')//获取章节信息
    {
        var info = {};
        if (document.getElementsByClassName('error-text fl').length) {
            info.s = 1;//404或其他错误
            sendResponse(info);
            return;
        }
        var ci = document.getElementsByTagName('script');
        for (var i = 0; i < ci.length; i++) {
            if (ci.item(i).innerHTML.indexOf('g_data') > -1) {
                var gd = ci.item(i).innerHTML;
                eval(gd)
                info.g = g_data;//获取全局信息
                break;
            }
        }
        ci = document.getElementsByClassName('content-wrap');
        var cq = ci.item(0);
        info.n = cq.innerHTML;//章节名
        var c = [];
        if (g_data.chapter.vipStatus == 1 && g_data.chapter.isBuy == 0) {
            var max = ci.length;
            var ci2 = document.getElementsByClassName('single j_subscribeBtn');
            cq = ci2.item(0);
            info.sd = cq.childNodes.item(1).firstElementChild.innerText - 1 + 1;//单章订阅
            ci2 = document.getElementsByClassName('all j_subscribeBtn ');
            cq = ci2.item(0);
            info.ad = cq.children.item(1).firstElementChild.innerText - 1 + 1;//全部订阅
            info.adc = cq.children.item(2).firstElementChild.innerText - 1 + 1;//总章节数
        }
        else max = ci.length - 1;
        if (max == 0) sendResponse(-1);
        for (var i2 = 1; i2 < max; i2++) {
            cq = ci.item(i2);
            c[i2 - 1] = cq.innerHTML;//内容
        }
        info.c = c;
        ci = document.getElementsByClassName('j_chapterWordCut');
        cq = ci.item(0);
        info.w = cq.innerHTML - 1 + 1;//字数
        ci = document.getElementsByClassName('j_updateTime');
        cq = ci.item(0);
        info.u = cq.innerHTML;//上传时间
        sendResponse(info);
    }
});
