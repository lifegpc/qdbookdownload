console.log('main.js');
var chapter_md = ["https://vipreader.qidian.com/chapter/*", "http://vipreader.qidian.com/chapter/*", "https://read.qidian.com/chapter/*", "http://read.qidian.com/chapter/*"];
var zhchapter_md = ["http://book.zongheng.com/chapter/*", "https://book.zongheng.com/chapter/*"];
var bookinfo_md = ["http://book.qidian.com/info/*", "https://book.qidian.com/info/*"];
var zhbookinfo_md = ["http://book.zongheng.com/book/*", "https://book.zongheng.com/book/*"];
var zhbookinfom_md = ["http://book.zongheng.com/showchapter/*", "https://book.zongheng.com/showchapter/*"];
var zhbookinfoo_md = ["http://book.zongheng.com/orderchapter*", "https://book.zongheng.com/orderchapter*"];
var bookfree_md = ["https://www.qidian.com/free", "http://www.qidian.com/free", "https://www.qidian.com/mm/free", "http://www.qidian.com/mm/free"];
var book_md = ["https://www.qidian.com/all*", "http://www.qidian.com/all*", "https://www.qidian.com/finish*", "http://www.qidian.com/finish*", "https://www.qidian.com/free/all*", "http://www.qidian.com/free/all*", "https://www.qidian.com/mm/all*", "http://www.qidian.com/mm/all*", "https://www.qidian.com/mm/finish*", "http://www.qidian.com/mm/finish*", "https://www.qidian.com/mm/free/all*", "http://www.qidian.com/mm/free/all*"];
var vip_status = ["免费", "付费"];
var isBuy = ["未购买", "已购买"];
var autoBuy = ['关闭', "开启"];
var vip = ['免费', 'VIP'];
var chapterinfo;
var clipboard;
/**@type {string} 页面类型*/
var lx;
var bookinfo;
var bookinfom;
/**@type {number} 当前页面*/
var tabid;
/**@type {number} 临时用Tableid*/
var tid;
/**@type {number} 临时用Tableid*/
var tid2;
/**1 起点章节下载整本小说 2 纵横下载 3纵横章节位置下载 4纵横书籍页获取订阅信息 5 起点限时免费页下载*/
var d = 0;
var setting;
/**@type {number} 当前页面*/
var ntid;
/**@type {Array<object>} 书单*/
var booklist;
/**@type {number} 当前窗口ID*/
var wid;
/**非书页获取书籍信息
 * @param {number} bookid 书籍ID
 * @param {number} i 输出信息位置（用于批量下载
 * @param {boolean} f 输出时弹出窗口（用于批量下载
*/
function getbookinfo(bookid, i = 0, f = false) {
    chrome.tabs.create({ url: "https://book.qidian.com/info/" + bookid, active: false }, function (tabs) {
        /**加载完毕后处理
         * @param {number} tid 标签页ID
        */
        function b(tid) {
            chrome.tabs.sendMessage(tid, { action: "getBookInfo" }, function (data) {
                chrome.tabs.remove(tid);
                console.log(data);
                if (d == 5)//发送
                {
                    if (data.s)//出现404
                    {
                        document.getElementById('o' + i).innerText = "出现错误：很有可能是404。";
                        return;
                    }
                    bsaveallastxt(data, i, f);
                    return;
                }
                if (data.s) {
                    alert("出现错误：很有可能是404。");
                    return;
                }
                bookinfo = data;
                if (d == 1) bsaveallastxt();
            });
        }
        if (tabs.status == "loading") {
            /**等待标签页加载完毕
             * @param {number} tid 标签页ID
            */
            function a(tid) {
                chrome.tabs.get(tid, function (tabs) {
                    if (tabs.status == "loading") {
                        setTimeout(function () { a(tid) }, 500);
                    }
                    else {
                        setTimeout(function () { b(tid) }, 1000);
                    }
                })
            }
            a(tabs.id);
        }
        else {
            setTimeout(function () { b(tabs.id) }, 1000);
        }
    });
}
function saveastxt() {
    saveAs(new Blob([document.getElementById('copytext').value], { type: 'text/plain' }), chapterinfo.g.bookInfo.bookName + "-" + chapterinfo.n + ".txt");
}
function zhsaveastxt() {
    saveAs(new Blob([document.getElementById('zhcopytext').value], { type: 'text/plain' }), chapterinfo.bn + "-" + chapterinfo.n + ".txt")
}
function saveallastxt() {
    d = 1;
    getbookinfo(chapterinfo.g.bookInfo.bookId);
}
/**获取save的设置*/
function getsaset() {
    var tem = {};
    var t = document.getElementsByClassName('c1');
    for (var i = 0; i < t.length; i++) {
        tem[t[i].id] = t[i].checked;
    }
    return tem;
}
/**起点保存一本书（书页）
 * @param bf 书籍信息
 * @param {number} i 输出信息位置（用于批量下载
 * @param {boolean} f 输出时弹出窗口（用于批量下载
*/
function bsaveallastxt(bf = bookinfo, i = 0, f = false) {
    chrome.runtime.sendMessage({ action: "savewholebook", info: bf, set: getsaset() }, function (data) {
        console.log(data);
        var s = '任务列表已有重复任务，添加失败。如需添加，请先停止已有重复任务。';
        if (data) s = '已加入任务列表。（注意请不要关闭插件打开的浏览器窗口）';
        if (d == 5) {
            document.getElementById('o' + i).innerText = s;
            if (f) alert('您选择的小说已尝试加入列表，详细情况请查看各本书下面的信息。');
        }
        else {
            alert(s);
        }
    });
}
function zhsaveallastxt() {
    d = 3;
    if (bookinfo == undefined) getzhbookinfo();
    else if (bookinfo.ml == undefined) gzbm();
    else if (bookinfo.dy == undefined) getzhbookinfoo(false, false, true, tid2);
    else {
        zhbsaveallastxt();
    }
}
function getzhbookinfo() {
    chrome.tabs.create({ url: "http://book.zongheng.com/book/" + chapterinfo.bid + ".html", active: false }, function (tabs) {
        /**加载完毕后处理*/
        function b() {
            chrome.tabs.sendMessage(tid, { action: "getzhBookInfo" }, function (data) {
                console.log(data);
                bookinfo = data;
                if (d == 3) {
                    tid2 = tid;
                    gzbm();
                    return;
                }
                chrome.tabs.remove(tid);
            });
        }
        tid = tabs.id;
        if (tabs.status == "loading") {
            /**等待标签页加载完毕*/
            function a() {
                chrome.tabs.get(tid, function (tabs) {
                    if (tabs.status == "loading") {
                        tid = tabs.id;
                        setTimeout(a, 500);
                    }
                    else {
                        setTimeout(b, 1000);
                    }
                })
            }
            a();
        }
        else {
            setTimeout(b, 1000);
        }
    });
}
function zhbsaveallastxt() {
    d = 2;
    if (bookinfo.ml == undefined) gzbm();
    else if (bookinfo.dy == undefined) getzhbookinfoo(true, false, true);
    else {
        chrome.runtime.sendMessage({ action: "zhsavewholebook", info: bookinfo, set: getsaset() }, function (data) {
            console.log(data);
            if (data) alert('已加入任务列表。（注意请不要关闭插件打开的浏览器窗口，插件的弹出式窗口可以关闭）');
            else alert('任务列表已有重复任务，添加失败。如需添加，请先停止已有重复任务。');
        });
    }
}
/**用于处理起点主站和女生站上的批量下载*/
function getallbook() {

}
function printinfo(data) {
    document.getElementById('title').innerText = data.n;
    document.getElementById('length').innerText = data.w;
    document.getElementById('updatetime').innerText = data.u;
    document.getElementById('textpre').innerText = data.c[0];
    document.getElementById('chapterid').innerText = data.g.chapter.id;
    document.getElementById('vipstatus').innerText = vip_status[data.g.chapter.vipStatus];
    if (data.g.chapter.vipStatus == 1) {
        document.getElementById('buystatus').style.display = null;
        document.getElementById('buystat').innerText = isBuy[data.g.chapter.isBuy];
        if (data.g.chapter.isBuy == 0) {
            document.getElementById('buystatd').style.display = null;
            document.getElementById('singlebuy').innerText = data.sd + "起点币";
            document.getElementById('allbuy').innerText = data.ad + "起点币（共" + data.adc + "章）";
        }
    }
    document.getElementById('autobuy').innerText = autoBuy[data.g.readSetting.autoBuy];
    document.getElementById('bookname').innerText = data.g.bookInfo.bookName;
    document.getElementById('bookid').innerText = data.g.bookInfo.bookId;
    document.getElementById('authorname').innerText = data.g.bookInfo.authorName;
    document.getElementById('authorid').innerText = data.g.bookInfo.authorId;
    if (data.g.chapter.prevId > -1) {
        document.getElementById('prevchapter').style.display = null;
        document.getElementById('prevchapterid').innerText = data.g.chapter.prevId;
    }
    if (data.g.chapter.nextId > -1) {
        document.getElementById('nextchapter').style.display = null;
        document.getElementById('nextchapterid').innerText = data.g.chapter.nextId;
    }
    var c = data.n + "\n字数：" + data.w + "\n上传时间：" + data.u;
    for (var i = 0; i < data.c.length; i++)c = c + "\n" + data.c[i];
    document.getElementById('copytext').value = c;
    addchilpboard();
    document.getElementById('saveastxt').addEventListener('click', saveastxt);
    document.getElementById('saveallastxt').addEventListener('click', saveallastxt);
}
function addchilpboard() {
    clipboard = new ClipboardJS(".copytextb");
    clipboard.on('success', function (e) {
        console.info('Action:', e.action);
        console.info('Text:', e.text);
        console.info('Trigger:', e.trigger);
        e.clearSelection();
    });
    clipboard.on('error', function (e) {
        console.error('Action:', e.action);
        console.error('Trigger:', e.trigger);
    });
}
function printzhinfo(data) {
    document.getElementById('zhtitle').innerText = data.n;
    document.getElementById('zhlength').innerText = data.w;
    document.getElementById('zhupdatetime').innerText = data.u;
    document.getElementById('zhtextpre').innerText = data.c[0];
    document.getElementById('zhchapterid').innerText = data.cid;
    document.getElementById('zhvipstatus').innerText = vip_status[data.cl];
    if (data.cl == 1) {
        document.getElementById('zhbuystatus').style.display = null;
        document.getElementById('zhbuystat').innerText = isBuy[data.buy];
        if (data.buy == 0) {
            document.getElementById('zhbuystatd').style.display = null;
            document.getElementById('zhsinglebuy').innerText = data.cmo + "纵横币";
            document.getElementById('zhblance').innerText = data.bl + "纵横币";
        }
    }
    document.getElementById('zhbookname').innerText = data.bn;
    document.getElementById('zhbookid').innerText = data.bid;
    document.getElementById('zhauthorname').innerText = data.an;
    if (data.pcid > 0) {
        document.getElementById('zhprevchapter').style.display = null;
        document.getElementById('zhprevchapterid').innerText = data.pcid;
    }
    if (data.ncid > 0) {
        document.getElementById('zhnextchapter').style.display = null;
        document.getElementById('zhnextchapterid').innerText = data.ncid;
    }
    var c = data.n + "\n字数：" + data.w + "\n上传时间：" + data.u;
    for (var i = 0; i < data.c.length; i++)c = c + "\n" + data.c[i];
    document.getElementById('zhcopytext').value = c;
    addchilpboard();
    document.getElementById('zhsaveastxt').addEventListener('click', zhsaveastxt);
    document.getElementById('zhsaveallastxt').addEventListener('click', zhsaveallastxt);
}
function getbooktagstr(tag, color) {
    var s = "";
    for (var i = 0; i < tag.length; i++) {
        if (tag[i].l == color) { if (s == "") s += tag[i].c; else s += ("、" + tag[i].c); }
    }
    return s;
}
function getatagstr(atag) {
    if (atag.length > 0) s = atag[0]; else s = "";
    for (var i = 1; i < atag.length; i++)s += ("、" + atag[i]);
    return s;
}
/**获取卷数详细信息*/
function getzjsd(ml) {
    var free = 0;
    var vip = 0;
    for (var i = 0; i < ml.length; i++) {
        if (ml[i].vip) vip++; else free++;
    }
    return ml.length + "（" + free + "卷免费，" + vip + "卷VIP）";
}
/**获取总章节数*/
function getzch(ml) {
    var vip = 0;
    var free = 0;
    for (var i = 0; i < ml.length; i++) {
        if (ml[i].vip) vip += ml[i].tc; else free += ml[i].tc;
    }
    return vip + free + "（" + free + "章免费，" + vip + "章付费）";
}
/**获取总字数*/
function getzss(ml) {
    var vip = 0;
    var free = 0;
    for (var i = 0; i < ml.length; i++) {
        if (ml[i].vip) vip += ml[i].tw; else free += ml[i].tw;
    }
    return vip + free + "（" + free + "字免费，" + vip + "字付费）";
}
/**获取购买情况*/
function getbuystat(ml) {
    var list = [];
    var m = 0
    for (var i = 0; i < ml.length; i++) {
        if (ml[i].vip) {
            list[m] = {};
            list[m].t = ml[i].t;
            list[m].tc = ml[i].tc;
            list[m].tw = ml[i].tw;
            var buy = 0;
            var buyw = 0;
            var notbuy = 0;
            var notbuyw = 0;
            for (var j = 0; j < ml[i].l.length; j++) {
                var t = ml[i].l[j];
                if (t.buy) {
                    buy++;
                    buyw += t.w;
                }
                else {
                    notbuy++;
                    notbuyw += t.w;
                }
            }
            list[m].b = buy;//购买章节数
            list[m].bw = buyw;//购买的字数
            list[m].nb = notbuy;
            list[m].nbw = notbuyw;
            m++;
        }
    }
    return list;
}
/**获取整本书购买情况*/
function getabuy(list) {
    var vip = 0;
    var vipw = 0;
    var buy = 0;
    var buyw = 0;
    var notbuy = 0;
    var notbuyw = 0;
    for (var i = 0; i < list.length; i++) {
        vip += list[i].tc;
        vipw += list[i].tw;
        buy += list[i].b;
        buyw += list[i].bw;
        notbuy += list[i].nb;
        notbuyw += list[i].nbw;
    }
    return "VIP章节共" + vip + "章，共" + vipw + "字\n已购买章节共" + buy + "章，共" + buyw + "字\n未购买章节共" + notbuy + "章，共" + notbuyw + "字";
}
/**获取分卷情况（包括购买情况）*/
function getfjinfo(ml, list) {
    var m = 0;
    var s = "";
    for (var i = 0; i < ml.length; i++) {
        if (i != 0) s += "\n";
        s += (ml[i].t + "（" + vip[ml[i].vip] + "卷，共" + ml[i].tc + "章，共" + ml[i].tw + "字");
        if (ml[i].vip) {
            s += ("；已购买章节共" + list[m].b + "章，共" + list[m].bw + "字；未购买章节共" + list[m].nb + "章，共" + list[m].nbw + "字");
            m++;
        }
        s += "）";
    }
    return s;
}
function caltw(ml) {
    for (var i = 0; i < ml.length; i++) {
        var tem = ml[i];
        var tw = 0;
        for (var j = 0; j < tem.l.length; j++) {
            tw += tem.l[j].w;
        }
        tem.tw = tw;
    }
}
function printbookinfo(data) {
    document.getElementById('bname').innerText = data.bn;
    document.getElementById('bid').innerText = data.g_data.pageJson.bookId;
    document.getElementById('aname').innerText = data.g_data.pageJson.authorInfo.authorName;
    document.getElementById('aid').innerText = data.g_data.pageJson.authorInfo.authorId;
    document.getElementById('bluetag').innerText = getbooktagstr(data.tag, "blue");
    document.getElementById('redtag').innerText = getbooktagstr(data.tag, "red");
    document.getElementById('bd').innerText = data.in;
    var c = data.ind[0];
    for (var i = 1; i < data.ind.length; i++)c += ("\n" + data.ind[i]);
    document.getElementById('bdd').innerText = c;
    document.getElementById('atag').innerText = getatagstr(data.atag);
    caltw(data.ml);
    document.getElementById('zjs').innerText = getzjsd(data.ml);
    document.getElementById('zch').innerText = getzch(data.ml);
    document.getElementById('zzs').innerText = getzss(data.ml);
    var list = getbuystat(data.ml);
    document.getElementById('buys').innerText = getabuy(list);
    document.getElementById('fj').innerText = getfjinfo(data.ml, list);
    document.getElementById('bsaveallastxt').addEventListener('click', function () { bsaveallastxt() });
}
function getzhbooktag(tag, str) {
    var s = "";
    for (var i = 0; i < tag.length; i++) {
        if (tag[i].l == str) {
            if (s != "") s += ("、" + tag[i].c); else s = tag[i].c;
        }
    }
    return s;
}
/**获取分卷VIP情况
 * @param ml 目录
 * @param d 是否包含订阅信息
*/
function getzhavip(ml, d = false) {
    /**总数*/
    var zvip = 0;
    var znvip = 0;
    var zvipw = 0;
    var znvipw = 0;
    if (d) {
        var zbuy = 0;
        var zbuyw = 0;
        var zbuyp = 0;
        var znbuyp = 0;
    }
    var jvip = 0;
    var list = [];
    for (var i = 0; i < ml.length; i++) {
        var vip = ml[i].vip
        if (!d || !vip) {
            var vip = 0;
            var vipw = 0;
            var nvip = 0;
            var nvipw = 0;
        }
        else {
            var buy = 0;
            var buyw = 0;
            var buyp = 0;
            var nbuyp = 0;
        }
        var m = {};
        var t = ml[i].l;
        for (var j = 0; j < t.length; j++) {
            if (!d || !vip) {
                if (t[j].vip) {
                    vip++;
                    vipw += t[j].w;
                }
                else {
                    nvip++;
                    nvipw += t[j].w;
                }
            }
            else {
                if (t[j].vip) {
                    if (t[j].buy) {
                        buy++;
                        buyw += t[j].w;
                        buyp += t[j].p;
                    }
                    else {
                        nbuyp += t[j].p;
                    }
                }
            }
        }
        if (!d || !vip) {
            m.v = vip;
            m.nv = nvip;
            m.w = vipw;
            m.nw = nvipw;
        }
        else {
            zbuy += buy;
            zbuyw += buyw;
            zbuyp += buyp;
            znbuyp += nbuyp;
            m.v = ml[i].vtc;
            m.w = ml[i].vtw;
            m.nv = ml[i].tc - m.v;
            m.nw = ml[i].tw - m.w;
            m.b = buy;
            m.nb = m.v - buy;
            m.bw = buyw;
            m.nbw = m.w - buyw;
            m.p = buyp;
            m.np = nbuyp;
        }
        zvip += m.v;
        znvip += m.nv;
        zvipw += m.w;
        znvipw += m.nw;
        if (ml[i].vip) jvip++;
        list[i] = m;
    }
    var tm = {};
    tm.v = zvip;
    tm.nv = znvip;
    tm.w = zvipw;
    tm.nw = znvipw;
    tm.l = list;
    tm.j = jvip;//vip卷数量
    tm.o = ml.length - jvip;//非VIP卷数量
    if (d) {
        tm.b = zbuy;
        tm.nb = zvip - zbuy;
        tm.bw = zbuyw;
        tm.nbw = zvipw - zbuyw;
        tm.p = zbuyp;
        tm.np = znbuyp;
    }
    return tm;
}
/**获取章节分卷信息详情
 * @param ml 目录数据
 * @param data getzhavip 的返回值
 * @param d 是否包含订阅数据 默认false
*/
function getzhfjinfo(ml, data, d = false) {
    var s = "";
    /**@param {string} s*/
    function getbuy(t2, s, k = true) {
        if (k) s += "（";
        if (t2.b == 0) {
            s += "全部未购买";
        }
        else if (t2.v != t2.b) {
            s += ("其中共" + t2.b + "章已购买章节，共" + t2.bw + "字，共" + t2.p + "纵横币；共" + t2.nb + "章未购买章节，共" + t2.nbw + "字，共" + t2.np + "纵横币");
        }
        else s += ("已全部购买");
        if (k) s += "）";
        return s;
    }
    for (var i = 0; i < ml.length; i++) {
        var t = ml[i];
        var t2 = data.l[i];
        s += (t.t + "（" + vip[t.vip] + "卷，共" + t.tc + "章，共" + t.tw + "字");
        if (t.vip && t.tc != t2.v) {
            s += ("。其中共" + t2.v + "章VIP章节，共" + t2.w + "字");
            if (d) {
                s = getbuy(t2, s);
            }
            s += ("；共" + t2.nv + "章免费章节，共" + t2.nw + "字");
        }
        else if (t.vip && d) {
            s += "。";
            s = getbuy(t2, s, false);
        }
        s += "）\n";
    }
    s += ("共" + data.v + "章VIP章节，共" + data.w + "字");
    if (d) s = getbuy(data, s, true);
    s += ("；共" + data.nv + "章免费章节，共" + data.nw + "字。");
    return s;
}
/**获取目录信息*/
function gzbm() {
    if (d != 3) document.getElementById('gzbma').style.display = 'none';
    chrome.tabs.create({ url: "http://book.zongheng.com/showchapter/" + bookinfo.bid + ".html", active: false }, function (tabs) {
        /**加载完毕后处理*/
        function b() {
            chrome.tabs.sendMessage(tid, { action: "getzhBookInfoom" }, function (data) {
                bookinfo.ml = data.ml;
                chrome.tabs.remove(tid);
                if (d == 3) {
                    zhsaveallastxt();
                    return;
                }
                document.getElementById('zhbim').style.display = null;
                var fjvip = getzhavip(data.ml);
                document.getElementById('zhjs').innerText = data.ml.length;
                document.getElementById('zhcs').innerText = fjvip.v + fjvip.nv;
                document.getElementById('zhzs').innerText = fjvip.w + fjvip.nw;
                document.getElementById('zhfj').innerText = getzhfjinfo(data.ml, fjvip);
                if (d == 4) {
                    getzhbookinfoo(true, true);
                    return;
                }
                if (d == 2) zhbsaveallastxt();
            });
        }
        tid = tabs.id;
        if (tabs.status == "loading") {
            /**等待标签页加载完毕*/
            function a() {
                chrome.tabs.get(tid, function (tabs) {
                    if (tabs.status == "loading") {
                        tid = tabs.id;
                        setTimeout(a, 500);
                    }
                    else {
                        setTimeout(b, 1000);
                    }
                })
            }
            a();
        }
        else {
            setTimeout(b, 1000);
        }
    });
}
/**纵横订阅页数据获取
 * @param ml 订阅页目录数据
*/
function getzhabuy(ml) {
    var zvipc = 0;
    var zvipw = 0;
    var zbuyc = 0;
    var zbuyw = 0;
    var zbuyp = 0;
    var znbuyp = 0;
    var re = [];
    for (var i = 0; i < ml.length; i++) {
        zvipc += ml[i].vtc;
        zvipw += ml[i].vtw;
        var tem = {};
        var buyc = 0;
        var buyw = 0;
        var buyp = 0;
        var nbuyp = 0;
        for (var j = 0; j < ml[i].l.length; j++) {
            var te = ml[i].l[j];
            if (te.buy) {
                buyc++;
                buyw += te.w;
                buyp += te.p;
            }
            else {
                nbuyp += te.p;
            }
        }
        tem.c = buyc;
        tem.w = buyw;
        tem.p = buyp;
        tem.nc = ml[i].vtc - buyc;
        tem.nw = ml[i].vtw - buyw;
        tem.np = nbuyp;
        re[i] = tem;
        zbuyc += buyc;
        zbuyw += buyw;
        zbuyp += buyp;
        znbuyp += nbuyp;
    }
    var t = {};
    t.vc = zvipc;
    t.vw = zvipw;
    t.vp = zbuyp + znbuyp;
    t.bc = zbuyc;
    t.bw = zbuyw;
    t.bp = zbuyp;
    t.nc = zvipc - zbuyc;
    t.nw = zvipw - zbuyw;
    t.np = znbuyp;
    t.l = re;
    return t;
}
/**获取订阅页分卷情况文字
 * @param ml 订阅页目录数据
 * @param data getzhabuy()函数的返回值
*/
function getzhofjinfo(ml, data) {
    var s = "";
    for (var i = 0; i < ml.length; i++) {
        if (s == "") s = ml[i].t; else s += ('\n' + ml[i].t);
        var te = data.l[i]
        s += ("（共" + ml[i].vtc + "章VIP章节，共" + ml[i].vtw + "字，共" + (te.p + te.np) + "纵横币。")
        if (te.c != 0 && te.nc != 0) {
            s += ("已购买章节" + te.c + "章，共" + te.w + "字，共" + te.p + "纵横币；未购买章节" + te.nc + "章，共" + te.nw + "字，共" + te.np + "纵横币）");
        }
        else if (te.c == 0) s += "全部未购买）";
        else s += "全部已购买）";
    }
    return s;
}
/**合并两种目录
 * @param ml 章节页面获取到的目录
 * @param vml 章节订阅页面获取到的目录
*/
function mergezhbookinfoml(ml, vml) {
    var j = 0;
    for (var i = 0; i < ml.length; i++) {
        if (ml[i].vip) {
            ml[i].vtc = vml[j].vtc;
            ml[i].vtw = vml[j].vtw;
            var te = ml[i].l;
            var tm = vml[j].l;
            var jj = 0;
            for (var ii = 0; ii < te.length; ii++) {
                if (te[ii].vip) {
                    te[ii].buy = tm[jj].buy;
                    te[ii].p = tm[jj].p;
                    jj++;
                }
            }
            j++;
        }
    }
}
/**获取详细订阅信息
 * @param {boolean} p true 在书籍主页面 false 不显示
 * @param {boolean} t true 第二次运行 默认 false
 * @param {boolean} f true zhbsaveallastxt 需要 默认false
 * @param {number} ttid 发送获取订阅窗口链接的标签页ID
*/
function getzhbookinfoo(p, t = false, f = false, ttid = ntid) {
    if (p && !t) {
        document.getElementById('zhbmg').style.display = "none";
    }
    if (bookinfo.ml == undefined) {
        d = 4;
        gzbm();
    }
    else if (bookinfo.dy == undefined) {
        chrome.tabs.sendMessage(ttid, { action: "getzhBookInfooh" }, function (href) {
            chrome.tabs.create({ url: href, active: false },
                function (tab) {
                    /**加载完毕后处理*/
                    function b() {
                        chrome.tabs.sendMessage(tid, { action: "getzhBookInfoo" }, function (data) {
                            console.log(data);
                            if (data.s) {
                                bookinfo.dy = true;
                                chrome.tabs.remove(tid);
                                if (!p) chrome.tabs.remove(ttid);
                                mergezhbookinfoml(bookinfo.ml, data.ml);
                                if (p) {
                                    var gvip = getzhavip(bookinfo.ml, true);
                                    document.getElementById('zhfj').innerText = getzhfjinfo(bookinfo.ml, gvip, true);
                                }
                                if (f) {
                                    zhbsaveallastxt();
                                }
                            }
                            else {
                                setTimeout(b, 1000);
                            }
                        });
                    }
                    tid = tab.id;
                    if (tab.status == "loading") {
                        /**等待标签页加载完毕*/
                        function a() {
                            chrome.tabs.get(tid, function (tab) {
                                if (tab.status == "loading") {
                                    tid = tab.id;
                                    setTimeout(a, 500);
                                }
                                else {
                                    setTimeout(b, 1000);
                                }
                            });
                        }
                        a();
                    }
                    else {
                        setTimeout(b, 1000);
                    }
                });
        });
    }
}
function printzhbookinfo(data) {
    document.getElementById('zhbname').innerText = data.bn;
    document.getElementById('zhbid').innerText = data.bid;
    document.getElementById('zhan').innerText = data.an;
    document.getElementById('zhbsd').innerText = getzhbooktag(data.tag, "state");
    document.getElementById('zhfl').innerText = getzhbooktag(data.tag, "label");
    document.getElementById('zhtag').innerText = getzhbooktag(data.tag, "o");
    document.getElementById('zhbd').innerText = data.in;
    document.getElementById('gzbm').addEventListener('click', gzbm);
    document.getElementById('zhbsaveallastxt').addEventListener('click', zhbsaveallastxt);
    document.getElementById('zhbmgeo').addEventListener('click', function () { getzhbookinfoo(true) });
}
function printzhbookinfom(data) {
    document.getElementById('zhbn').innerText = data.bn;
    document.getElementById('zhman').innerText = data.an;
    var fjvip = getzhavip(data.ml);
    document.getElementById('zhmjs').innerText = data.ml.length;
    document.getElementById('zhmcs').innerText = fjvip.v + fjvip.nv;
    document.getElementById('zhmzs').innerText = fjvip.w + fjvip.nw;
    document.getElementById('zhmfj').innerText = getzhfjinfo(data.ml, fjvip);
}
function printzhbookinfoo(data) {
    document.getElementById('zhbno').innerText = data.bn;
    document.getElementById('zhano').innerText = data.an;
    var ab = getzhabuy(data.ml);
    document.getElementById('zhvjs').innerText = data.ml.length + "卷";
    document.getElementById('zhvcs').innerText = ab.vc + "章（其中已购买章节" + ab.bc + "章，未购买章节" + ab.nc + "章）";
    document.getElementById('zhvzs').innerText = ab.vw + "字（其中已购买章节" + ab.bw + "字，未购买章节" + ab.nw + "字）";
    document.getElementById('zhvzp').innerText = ab.vp + "纵横币（其中已购买章节" + ab.bp + "纵横币，未购买章节" + ab.np + "纵横币）";
    document.getElementById('zhvfj').innerText = getzhofjinfo(data.ml, ab);
}
/**保存设置 width 窗口宽度*/
function osasetting(width) {
    document.getElementById('sasetting').style.display = null;
    document.getElementById('sasetting').style.width = width / 2;
    document.getElementById('snbuy').checked = setting.snbuy;
    document.getElementById('tnbuy').checked = setting.tnbuy;
    if (setting.autosave) {
        function temp(i) { sasetautos(i) };
        document.getElementById('snbuy').addEventListener('change', temp);
        document.getElementById('tnbuy').addEventListener('change', temp);
    }
}
/**修改选项后自动保存*/
function sasetautos(i) {
    var tem = {};
    var e = i.srcElement;
    tem[e.id] = e.checked;
    chrome.storage.sync.set(tem);
}
/**处理起点限时免费界面
 * @param data 获取到的信息
*/
function freebookc(data) {
    /**新建一个Div元素
     * @param {string} s innerText
     * @returns {HTMLDivElement}
    */
    function cdiv(s = "") {
        var div = document.createElement('div');
        if (s == "") return div;
        else {
            div.innerText = s;
            return div;
        }
    }
    /**@type {HTMLInputElement} 全选按钮*/
    var fba = document.getElementById('fba');
    fba.disabled = null;
    /**根据按钮选择情况更新
     * @param {number} qx 是否全选 1 全选 2 全不选 0 不变
    */
    function getfb(qx = 0) {
        /**@type {HTMLCollectionOf<HTMLInputElement>} 所有选择按钮*/
        var ci = document.getElementsByClassName('fb');
        var zp = 0;
        var zc = 0;
        for (var i = 0; i < ci.length; i++) {
            if (qx == 1) ci[i].checked = true; else if (qx == 2) ci[i].checked = null;
            if (ci[i].checked) {
                zc++;
                zp += booklist[i].p;
            }
        }
        document.getElementById('fd').innerText = "您已选择了" + zc + "本书，共¥" + zp;
        if (zc == i) {
            fba.indeterminate = null;
            fba.checked = true;
        }
        else if (zc == 0) {
            fba.checked = null;
            fba.indeterminate = null;
        }
        else {
            fba.checked = null;
            fba.indeterminate = true;
        }
    }
    fba.addEventListener('click', function () {
        if (!fba.checked) {
            getfb(2);
        }
        else {
            getfb(1);
        }
    });
    var div = document.getElementById('freebookl');
    var style = document.createElement('style');
    style.innerText = ".fc{display:inline-block}";
    div.append(style);
    /**获取每一本书的界面
     * @param data 一本书的信息
     * @param {number} i 序号（从0开始）
     * @returns {HTMLDivElement} 一本书界面信息
    */
    function getdiv(data, i) {
        var div = cdiv();
        var input = document.createElement('input');
        input.type = "checkbox";
        input.className = "fb";
        input.checked = true;
        input.addEventListener('click', function () { getfb() });
        div.append(input);
        /**显示
         * @param data 书籍信息
         * @param {MouseEvent} e 鼠标事件
        */
        function printd(data, e) {
            var ee = e.srcElement;
            /**从e获取名为id的属性值
             * @param {string} id 属性名
            */
            function gets(id) {
                return ee.getAttribute(id);
            }
            /**设置e的属性名为id的属性值
             * @param {string} id 属性名
             * @param {string} va 属性值
            */
            function sets(id, va) {
                ee.setAttribute(id, va)
            }
            var i = gets('i');
            var d = gets('d');
            var div = document.getElementById('i' + i);
            if (d == 0) {
                div.append(cdiv("作品简介："));
                div.append(cdiv(data.in));
                div.append(cdiv('作者名：'));
                div.append(cdiv(data.an));
                div.append(cdiv('作品分类：'));
                div.append(cdiv(data.fl));
                div.append(cdiv('作品状态：'));
                div.append(cdiv(data.s));
                div.style.display = null;
                sets('d', 1);
            }
            else if (d == 1) {
                div.style.display = "none";
                sets('d', 2);
            }
            else {
                div.style.display = null;
                sets('d', 1);
            }
        }
        var div2 = cdiv(data.bn + "（¥" + data.p + "）");
        div2.setAttribute('i', i);
        div2.setAttribute('d', 0);
        div2.className = "fc";
        (function (data) { div2.addEventListener('click', function (e) { printd(data, e) }) })(data);
        div.append(div2);
        var div3 = cdiv();
        div3.id = "i" + i;
        div3.style.display = "none";
        div.append(div3);
        var div4 = cdiv();
        div4.id = "o" + i;//用于显示返回数据
        div.append(div4);
        return div;
    }
    var ap = 0;
    for (var i = 0; i < data.length; i++) {
        div.append(getdiv(data[i], i));
        ap += data[i].p;
    }
    var div4 = cdiv("您已选择了" + i + "本书，共¥" + ap);
    div4.id = "fd";
    div.append(div4);
    div.append(getbu());
}
/**返回保存以上书为TXT按钮（免费限时页，书库页 */
function getbu() {
    var bu = document.createElement('button');
    bu.innerText = "保存以上选中书为TXT";
    bu.addEventListener('click', function () {
        /**@type {HTMLCollectionOf<HTMLInputElement>} 所有选择按钮*/
        var ci = document.getElementsByClassName('fb');
        var c = 0;
        d = 5;
        var l = 0;
        for (var i = 0; i < ci.length; i++) {
            if (ci[i].checked) l = i;
        }
        for (var i = 0; i < ci.length; i++) {
            if (ci[i].checked) {
                (function (bookid, i, c, f) { setTimeout(function () { getbookinfo(bookid, i, f) }, 4000 * c) })(booklist[i].h.split('info/')[1] - 1 + 1, i, c, i == l);
                c++;
            }
        }
        if (c == 0) {
            alert('您没有选择需要下载的小说！');
        }
    });
    return bu;
}
/**处理起点全部作品等界面
 * @param data 获取到的信息
*/
function abookc(data) {
    /**新建一个Div元素
     * @param {string} s innerText
     * @returns {HTMLDivElement}
    */
    function cdiv(s = "") {
        var div = document.createElement('div');
        if (s == "") return div;
        else {
            div.innerText = s;
            return div;
        }
    }
    /**新建一个内部带有超链接的Div元素
     * @param {string} s innerText
     * @param {string} h href
     * @returns {HTMLDivElement}
    */
    function cdiva(s, h) {
        var div = cdiv();
        var a = document.createElement('a');
        a.innerText = s;
        a.href = h;
        a.addEventListener('click', function (e) {
            e.preventDefault();
            chrome.tabs.create({ url: e.srcElement.href });
        });
        div.append(a);
        return div;
    }
    /**@type {HTMLInputElement} 全选按钮*/
    var fbb = document.getElementById('fbb');
    fbb.disabled = null;
    /**根据按钮选择情况更新
     * @param {number} qx 是否全选 1 全选 2 全不选 0 不变
    */
    function getfb(qx = 0) {
        /**@type {HTMLCollectionOf<HTMLInputElement>} 所有选择按钮*/
        var ci = document.getElementsByClassName('fb');
        var zc = 0;
        for (var i = 0; i < ci.length; i++) {
            if (qx == 1) ci[i].checked = true; else if (qx == 2) ci[i].checked = null;
            if (ci[i].checked) {
                zc++;
            }
        }
        document.getElementById('fd').innerText = "您已选择了" + zc + "本书";
        if (zc == i) {
            fbb.indeterminate = null;
            fbb.checked = true;
        }
        else if (zc == 0) {
            fbb.checked = null;
            fbb.indeterminate = null;
        }
        else {
            fbb.checked = null;
            fbb.indeterminate = true;
        }
    }
    fbb.addEventListener('click', function () {
        if (!fbb.checked) {
            getfb(2);
        }
        else {
            getfb(1);
        }
    });
    var div = document.getElementById('booklist');
    var style = document.createElement('style');
    style.innerText = ".fc{display:inline-block}";
    div.append(style);
    /**获取书籍所在的界面
     * @param data 书籍信息
     * @param {number} i 序号(从0开始)
     * @param {number} c 书籍显示模式（与需要显示的内容相关
     * @returns {HTMLDivElement}
    */
    function getdiv(data, i, c) {
        var div = cdiv();
        var input = document.createElement('input');
        input.type = "checkbox";
        input.className = "fb";
        input.checked = true;
        input.addEventListener('click', function () { getfb() });
        div.append(input);
        /**显示
         * @param data 书籍信息
         * @param {MouseEvent} e 鼠标事件
         * @param {number} c 书籍显示模式
        */
        function printd(data, e, c) {
            var ee = e.srcElement;
            /**从e获取名为id的属性值
             * @param {string} id 属性名
            */
            function gets(id) {
                return ee.getAttribute(id);
            }
            /**设置e的属性名为id的属性值
             * @param {string} id 属性名
             * @param {string} va 属性值
            */
            function sets(id, va) {
                ee.setAttribute(id, va)
            }
            var i = gets('i');
            var d = gets('d');
            var div = document.getElementById('i' + i);
            if (d == 0) {
                div.append(cdiva('作品详情页', data.h));
                if (c) {
                    div.append(cdiv('作品简介：'));
                    div.append(cdiv(data.in));
                }
                div.append(cdiv('作者名：'));
                div.append(cdiv(data.an));
                /**获取分类字符串
                 * @param {Array<string>} fl 分类
                 * @returns {string}
                */
                function getflstr(fl) {
                    var s = fl[0] + "·" + fl[1];
                    if (fl.length == 3) s += ("、" + fl[2]);
                    return s;
                }
                div.append(cdiv('分类：'))
                if (data.fl.constructor.name == "String") div.append(cdiv(data.fl))
                else div.append(cdiv(getflstr(data.fl)));
                if (c) {
                    div.append(cdiv('作品状态：'));
                    div.append(cdiv(data.s));
                }
                else {
                    div.append(cdiv('最新章节：'));
                    var div2 = cdiva(data.cn, data.cp);
                    div2.innerHTML += ("（" + data.ct + "）");
                    div.append(div2);
                }
                sets('d', 1);
            }
            else if (d == 1) {
                div.style.display = "none";
                sets('d', 2);
            }
            else if (d == 2) {
                div.style.display = null;
                sets('d', 1);
            }
        }
        var div2 = cdiv(data.bn);
        div2.setAttribute('i', i);
        div2.setAttribute('d', 0);
        div2.className = "fc";
        (function (data) { div2.addEventListener('click', function (e) { printd(data, e, c) }) })(data);
        div.append(div2);
        var div3 = cdiv();
        div3.id = "i" + i;
        div.append(div3);
        var div4 = cdiv();
        div4.id = "o" + i;
        div.append(div4);
        return div;
    }
    for (var i = 0; i < data.l.length; i++) {
        div.append(getdiv(data.l[i], i, data.c));
    }
    var div4 = cdiv("您已选择了" + i + "本书");
    div4.id = "fd";
    div.append(div4);
    div.append(getbu());
}
function sendmess(tabs) {
    (function () {
        /**@param {MouseEvent} e*/
        function adde(e) {
            e.preventDefault();
            chrome.tabs.create({ url: e.srcElement.href });
        }
        var div = document.createElement('div');
        div.style.width = tabs[0].width / 2;
        var style = document.createElement('style');
        style.innerText = ".vl{display:inline-block;";
        div.append(style);
        var div2 = document.createElement('div');
        var a = document.createElement('a');
        a.innerText = "源代码";
        a.href = "https://github.com/lifegpc/qdbookdownload"
        a.addEventListener('click', adde);
        var div3 = document.createElement('div');
        div3.className = "vl";
        div3.innerText = "已开源至Github";
        div2.append(a);
        div2.append(div3);
        div.append(div2);
        div2 = document.createElement('div');
        div3 = document.createElement('div');
        div3.innerText = "采用";
        div3.className = "vl";
        div2.append(div3);
        a = document.createElement('a');
        a.innerText = "GNU公共许可证";
        a.href = "LICENSE";
        a.addEventListener('click', adde);
        div2.append(a);
        div.append(div2);
        document.body.append(div);
    })();
    /**显示指定元素显示并设置宽度
     * @param {string} id 元素ID
     * @param tab 当前标签页数组
    */
    function displayn(id, tab = tabs) {
        document.getElementById(id).style.display = null;
        document.getElementById(id).style.width = tab[0].width / 2;
    }
    tabid = tabs[0].id;
    chrome.runtime.sendMessage({ action: "getruninfo" }, function (data) {
        if (data != 0) {
            document.getElementById('runinfoa').style.display = "inline-block";
            document.getElementById('runinfoa').style.width = tabs[0].width / 2;
            document.getElementById('runinfo').innerText = data;
            document.getElementById('runmanage').addEventListener('click', function () {
                chrome.tabs.create({ url: "taskmanage.html" });
            })
        }
    });
    for (var i = 0; i < chapter_md.length; i++) {
        if (tabs[0].url.search(chapter_md[i]) > -1) {
            displayn('chapterinfo');
            function sendRequest() {
                chrome.tabs.sendMessage(tabs[0].id, { action: 'getCheapter' }, function (data) {
                    console.log(data);
                    if (data == -1) {
                        setTimeout(sendRequest, 1000);
                        return;
                    }
                    if (data.s) {
                        document.getElementById('chapterinfo').innerHTML = "出现错误：很有可能是404。";
                        return;
                    }
                    printinfo(data); chapterinfo = data;
                });
            };
            sendRequest();
            lx = "qdc";
            osasetting(tabs[0].width);
            break;
        }
    }
    for (var i = 0; i < zhchapter_md.length; i++) {
        if (tabs[0].url.search(zhchapter_md[i]) > -1) {
            displayn('zhchapterinfo');
            chrome.tabs.sendMessage(tabs[0].id, { action: 'getzhChapter' }, function (data) { console.log(data); printzhinfo(data); chapterinfo = data; });
            lx = "zhc";
            osasetting(tabs[0].width);
            break;
        }
    }
    for (var i = 0; i < bookinfo_md.length; i++) {
        if (tabs[0].url.search(bookinfo_md[i]) > -1) {
            displayn('bookinfo');
            chrome.tabs.sendMessage(tabs[0].id, { action: 'getBookInfo' }, function (data) {
                console.log(data);
                if (data.s) {
                    document.getElementById('bookinfo').innerHTML = "出现错误：很有可能是404。";
                    return;
                }
                printbookinfo(data); bookinfo = data;
            });
            lx = "qdb";
            osasetting(tabs[0].width);
            break;
        }
    }
    for (var i = 0; i < zhbookinfo_md.length; i++) {
        if (tabs[0].url.search(zhbookinfo_md[i]) > -1) {
            displayn('zhbookinfo');
            chrome.tabs.sendMessage(tabs[0].id, { action: 'getzhBookInfo' }, function (data) { console.log(data); printzhbookinfo(data); bookinfo = data; });
            lx = "zhb";
            osasetting(tabs[0].width);
            break;
        }
    }
    for (var i = 0; i < zhbookinfom_md.length; i++) {
        if (tabs[0].url.search(zhbookinfom_md[i]) > -1) {
            displayn('zhbookinfom');
            chrome.tabs.sendMessage(tabs[0].id, { action: 'getzhBookInfom' }, function (data) { console.log(data); printzhbookinfom(data); bookinfom = data; });
            lx = "zhbm";
            break;
        }
    }
    for (var i = 0; i < zhbookinfoo_md.length; i++) {
        if (tabs[0].url.search(zhbookinfoo_md[i]) > -1) {
            displayn('zhbookinfoo');
            function send() {
                chrome.tabs.sendMessage(tabs[0].id, { action: "getzhBookInfoo" }, function (data) {
                    console.log(data); if (data.s) {
                        printzhbookinfoo(data);
                    } else setTimeout(send, 1000)
                });
            }
            send();
            lx = "zhbo";
            break;
        }
    }
    for (var i = 0; i < bookfree_md.length; i++) {
        if (tabs[0].url == bookfree_md[i]) {
            displayn('freebookl');
            chrome.tabs.sendMessage(tabs[0].id, { action: "getNowFreeBook" }, function (data) {
                console.log(data);
                freebookc(data.l);
                booklist = data.l;
            });
            osasetting(tabs[0].width);
            lx = "qdbf";
            break;
        }
    }
    for (var i = 0; i < book_md.length; i++) {
        if (tabs[0].url.search(book_md[i]) > -1) {
            displayn('booklist');
            chrome.tabs.sendMessage(tabs[0].id, { action: "getBookList" }, function (data) {
                console.log(data);
                abookc(data);
                booklist = data.l;
            });
            osasetting(tabs[0].width);
            lx = "qdbl";
            break;
        }
    }
}
chrome.storage.sync.get(function (data)//获取设置信息
{
    console.log(data);
    setting = data;
    chrome.windows.getCurrent(function (window)//获得现在的窗口
    {
        wid = window.id;
        chrome.tabs.query({ active: true, windowId: window.id }, function (data) { console.log(data); sendmess(data); ntid = data[0].id });//获取标签页
    });
});
