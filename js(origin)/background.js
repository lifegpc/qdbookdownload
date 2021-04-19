console.log('background.js');
clearTempfileDb();
(function () {//检查chrome.stroage.sync
    function getv(version)//获取版本数组
    {
        var l = version.split(".");
        for (var i = 0; i < l.length; i++)l[i] = l[i] - 1 + 1;
        return l;
    }
    /**比较版本数组
     * @param {Array<number>} v1 版本数组
     * @param {Array<number>} v2 版本数组
     * @returns 前面大 1，相等 0，后面大 -1*/
    function comv(v1, v2) {
        if (v1 > v2) return 1;
        else if (v1 < v2) return -1;
        else return 0;
    }
    /**判断obj是否为name类型
     * @param {string} name constructor名字
    */
    function iss(obj, name) {
        return obj.constructor.name == name;
    }
    function isa(obj, name) {
        return obj == undefined || !iss(obj, name);
    }
    var mf = chrome.runtime.getManifest();//获取mamifest
    function wsync()//写入初始化数据
    {
        var tem = {};
        tem.version = mf.version;
        tem.autosave = false;
        tem.snbuy = false;
        tem.tnbuy = true;
        chrome.storage.sync.set(tem);
    }
    chrome.storage.sync.get(function (data)//获取存储的数据
    {
        console.log(data);
        /**当前版本*/
        var nv = getv(mf.version);
        /**存储数据版本*/
        var cv;
        if (data.version != undefined) cv = getv(data.version);
        if (data.version == undefined || comv(nv, cv) == -1)//从未存储过数据或数据损坏或当前版本低于存储数据的版本
        {
            chrome.storage.sync.clear(function () {
                wsync();
            });//清理存储区域
        }
        else if (comv(nv, cv))//当前版本高于存储版本
        {
            var tem = {};
            tem.version = mf.version;
            chrome.storage.sync.set(tem);
        }
        else//校验完整性
        {
            var tem = {};
            var need = false;//是否需要修改
            if (isa(data.autosave, 'Boolean'))//是否自动保存选项
            {
                tem.autosave = false;
                need = true;
            }
            if (isa(data.snbuy, 'Boolean'))//是否保存未购买章节
            {
                tem.snbuy = false;
                need = true;
            }
            if (isa(data.tnbuy, 'Boolean'))//标识未购买章节（首先需启用保存未购买章节）
            {
                tem.tnbuy = true;
                need = true;
            }
            if (need) {
                chrome.storage.sync.set(tem);
            }
        }
    });
})();
var runlist = [];//正在run的任务列表
var zd = ['起点中文网', '纵横中文网'];
var lx = ['txt', 'epub'];
var st = ['正在运行', '正在停止'];
var wid = 0;
var isc = 0;
chrome.runtime.onMessage.addListener(function (message, sender, sendResponse) {
    if (message.action == "getruninfo") {
        sendResponse(runlist.length);
        return;
    }
    if (message.action == "getruninfod") {
        function geta(inp)//获取需要输出的数据
        {
            /**获取设置*/
            function getb(inp) {
                var s = "";
                /**将s与i相连*/
                function getc(s, i) {
                    if (s == "") return i;
                    else return s += ("\n" + i);
                }
                if (inp.snbuy != undefined && inp.snbuy) {
                    s = getc(s, "保存未购买章节");
                    if (inp.tnbuy != undefined && inp.tnbuy) s = getc(s, "标注未购买章节");
                }
                return s;
            }
            var o = [inp.bn, inp.bid, zd[inp.z], lx[inp.l], inp.c, inp.n, st[inp.s], getb(inp.se)];
            return o;
        }
        var list = [];
        for (var i = 0; i < runlist.length; i++)list[i] = geta(runlist[i]);
        sendResponse(list);
        return;
    }
    if (message.action == "taskstop") {
        runlist[message.i].s = 1;
        sendResponse(1);
        return;
    }
    function comparetorunlist(tem)//匹配是否有相同任务
    {
        if (runlist.length < 1) return false;
        else {
            for (var i = 0; i < runlist.length; i++) {
                var t = runlist[i];
                if (tem.z == t.z && tem.bid == t.bid) return true;
            }
        }
        return false;
    }
    if (message.action == "savewholebook")//起点下载整本书
    {
        function getbookinfo(info) {
            var s = info.bn;//书名
            s += ("\n作者：" + info.g_data.pageJson.authorInfo.authorName);
            s += ("\n作品介绍：" + info.in + "\n作品详细介绍：");
            for (var i = 0; i < info.ind.length; i++)s += ("\n" + info.ind[i]);
            return s;
        }
        var tem = {};//存储基础任务信息
        tem.z = 0;//站点，0起点，1纵横
        tem.l = 0;//0保存为TXT
        if (message.hasOwnProperty("epub")) {
            if (message["epub"] == true) {
                tem.l = 1;
            }
        }
        tem.bid = message.info.g_data.pageJson.bookId;//书籍ID
        tem.bn = message.info.bn;//书名
        tem.ml = message.info.ml;//目录
        var t = message.info.ml;
        var c = 0;
        for (var i = 0; i < t.length; i++)c += t[i].tc;
        tem.c = c;//总章数
        tem.n = 0;//已完成章数
        tem.s = 0;//是否停止
        if (tem.l == 0) tem.o = [getbookinfo(message.info)];
        else {
            tem.epub = new EPUB(message.info);
            if (message.info.hasOwnProperty("cover")) {
                getCoverImg(message.info["cover"]).then((b) => {
                    tem.epub.addCoverImg(b);
                })
            }
        }
        tem.se = message.set;
        if (comparetorunlist(tem)) {
            sendResponse(0);//重复文件
            return;
        }
        runlist[runlist.length] = tem;
        run(tem, 0, 0);
        sendResponse(1);
        return;
    }
    if (message.action == "zhsavewholebook")//纵横下载整本书
    {
        function getbookinfo(info) {
            var s = info.bn;//书名
            s += ("\n作者：" + info.an + "\n作品介绍：" + info.in);
            return s;
        }
        var tem = {};//存储基础任务信息
        tem.z = 1;//纵横
        tem.l = 0;//txt
        tem.bid = message.info.bid;//书籍ID
        tem.bn = message.info.bn;//书名
        tem.ml = message.info.ml;//目录
        var t = message.info.ml;
        var c = 0;
        for (var i = 0; i < t.length; i++)c += t[i].tc;
        tem.c = c;//总章数
        tem.n = 0;//已完成章数
        tem.s = 0;//是否停止
        if (tem.l == 0) tem.o = [getbookinfo(message.info)];
        tem.se = message.set;
        if (comparetorunlist(tem)) {
            sendResponse(0);
            return;
        }
        runlist[runlist.length] = tem;
        run(tem, 0, 0);
        sendResponse(1);
        return;
    }
});
function run(inp, i, j) {
    function errorcl(e) {
        console.log(e);
        if (!isc) {
            isc = 1;
            chrome.windows.create({ state: chrome.windows.WindowState.MINIMIZED }, function (window) { wid = window.id; isc = 0; run(inp, i, j); });//创建窗口
        }
    }
    if (inp.s) {
        if (inp.l == 0) savetxt(inp);
        else if (inp.l == 1) saveepub(inp);
        return;
    }
    if (j >= inp.ml[i].l.length) {
        j = 0; i++;
    }
    if (j == 0 && i < inp.ml.length && inp.l == 1) {
        /**@type {EPUB}*/
        let e = inp.epub;
        inp.child = e.appendXHtmlNode(i, j, inp.ml[i]);
    }
    if (i < inp.ml.length && wid != 0) {
        if (!inp.se.snbuy && ((inp.z == 0 && inp.ml[i].l[j].buy == 0 && inp.ml[i].vip == 1) || (inp.z == 1 && inp.ml[i].l[j].buy != undefined && inp.ml[i].l[j].buy == 0)))//不保存未购买章节
        {
            inp.c--;
            setTimeout(function () { run(inp, i, j + 1) }, 0);
            return;
        }
        try {
            chrome.tabs.create({ windowId: wid, url: inp.ml[i].l[j].h, active: false }, function (tabs) {
                function b(tid)//加载完毕后
                {
                    try {
                        var acm = "getCheapter";
                        if (inp.z == 1) acm = "getzhChapter";
                        function sendRequest() {
                            chrome.tabs.sendMessage(tid, { action: acm }, function (data) {
                                if (data == -1) {
                                    setTimeout(sendRequest, 1000);
                                    return;
                                }
                                if (inp.z == 0 && data.s)//起点章节404检测
                                {
                                    inp.s = 1;
                                    return;
                                }
                                function gets(data, i, inp) {
                                    var s;
                                    if (j == 0) s = inp.ml[i].t + "\n\n" + data.n;
                                    else s = data.n;//章节名
                                    if (inp.se.tnbuy && ((inp.z == 0 && data.g.chapter.isBuy == 0 && data.g.chapter.vipStatus == 1) || (inp.z == 1 && data.cl == 1 && data.buy == 0))) s += ("\n（未购买章节）");//添加标识
                                    s += ("\n字数：" + data.w);
                                    s += ("\n上传时间：" + data.u);
                                    for (var i = 0; i < data.c.length; i++)s += ("\n" + data.c[i]);
                                    return s;
                                }
                                if (inp.l == 0) inp.o[inp.n + 1] = gets(data, i, inp);
                                else if (inp.l == 1) {
                                    if (inp.se.tnbuy && ((inp.z == 0 && data.g.chapter.isBuy == 0 && data.g.chapter.vipStatus == 1) || (inp.z == 1 && data.cl == 1 && data.buy == 0))) data.notbuy = 1;
                                    /**@type {EPUB}*/
                                    let e = inp.epub;
                                    e.appendXHtmlNode(i, j, data, inp.child);
                                }
                                inp.n++;
                                setTimeout(function () { run(inp, i, j + 1) }, 0);
                                chrome.tabs.remove(tid);
                            });
                        }
                        sendRequest()
                    } catch (f) { errorcl(f) }
                }
                function a(tid)//等待加载完毕
                {
                    try {
                        chrome.tabs.get(tid, function (tabs) {
                            if (tabs.status == "loading") {
                                a(tabs.id);
                            }
                            else setTimeout(function () { b(tabs.id); }, 1000);
                        });
                    } catch (f) { errorcl(f) }
                }
                if (tabs.status == "loading") a(tabs.id); else setTimeout(function () { b(tabs.id); }, 1000);
            });
        }
        catch (f) {
            errorcl(f)
        }
        return;
    }
    else if (i == inp.ml.length)//工作完成
    {
        if (inp.l == 0) savetxt(inp);
        else if (inp.l == 1) saveepub(inp);
        return;
    }
    if (wid == 0 && (!isc)) {
        isc = 1;
        chrome.windows.create({ state: chrome.windows.WindowState.MINIMIZED }, function (window) { wid = window.id; isc = 0;; run(inp, i, j); });//创建窗口
    }
}
function savetxt(inp) {
    chrome.tabs.create({ url: "save.html" }, function (tabs) {
        function b(tid)//加载完毕后
        {
            var o = "";
            while (inp.o.length > 0) {
                if (o == "") o = inp.o.pop();
                else o = (inp.o.pop() + "\n\n" + o);
            }
            sendFile(inp.bn + "," + new Date().toISOString(), new Blob([inp.bn], { "type": "text/plain; charset: UTF-8" }), inp.bn + ".txt").then((data) => { console.log(data); })
        }
        function a(tid)//等待加载完毕
        {
            chrome.tabs.get(tid, function (tabs) {
                if (tabs.status == "loading") {
                    a(tabs.id);
                }
                else b(tabs.id);
            });
        }
        if (tabs.status == "loading") a(tabs.id); else b(tabs.id);
    });
}
function saveepub(inp) {
    chrome.tabs.create({ url: "save.html" }, function (tabs) {
        function b(tid)//加载完毕后
        {
            /**@type {EPUB}*/
            let e = inp.epub;
            e.generate().then((b) => {
                sendFile(inp.bn + "," + new Date().toISOString(), b, inp.bn + ".epub").then((data) => { console.log(data); })
            })
        }
        function a(tid)//等待加载完毕
        {
            chrome.tabs.get(tid, function (tabs) {
                if (tabs.status == "loading") {
                    a(tabs.id);
                }
                else b(tabs.id);
            });
        }
        if (tabs.status == "loading") a(tabs.id); else b(tabs.id);
    });
}
function c() {
    function remove(i) {
        var temp = [];
        var m = 0;
        for (var j = 0; j < runlist.length; j++) {
            if (j != i) { temp[m] = runlist[j]; m++ }
        }
        runlist = temp;
    }
    for (var i = 0; i < runlist.length; i++) {
        if (runlist[i].c == runlist[i].n || runlist[i].s) { remove(i); i--; }
    }
    setTimeout(c, 2000);
}
c();
/**
 * 发送GET请求
 * @param {string} url 地址
 */
function getCoverImg(url) {
    var xhr = new XMLHttpRequest();
    var uri = new URL(url, window.location.href);
    xhr.open("GET", uri.href);
    xhr.responseType = "blob";
    return new Promise((r) => {
        xhr.onload = () => {
            r(xhr.response)
        }
        xhr.send()
    })
}
