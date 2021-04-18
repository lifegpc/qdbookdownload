let dc = "http://purl.org/dc/elements/1.1/";
let opf = "http://www.idpf.org/2007/opf";
let JSZip = window.JSZip;
class EPUBMeta {
    constructor(data, doc) {
        this.data = {};
        Object.assign(this.data, data);
        this.doc = doc;
    }
    /**
     * 起点作者信息
     */
    get authorInfo() {
        let pageJson = this.pageJson;
        if (pageJson) {
            if (pageJson.hasOwnProperty("authorInfo")) {
                let authorInfo = pageJson["authorInfo"];
                if (authorInfo != null && typeof authorInfo == "object") return authorInfo;
                return null;
            }
        }
    }
    /**
     * 获取图书名
     */
    get bookname() {
        if (this.data.hasOwnProperty("bn")) {
            if (typeof this.data["bn"] == "string") {
                if (this.data["bn"].length) return this.data["bn"];
            }
        }
        return null;
    }
    get creator() {
        let authorInfo = this.authorInfo;
        if (authorInfo) {
            if (authorInfo.hasOwnProperty("authorName")) {
                if (typeof authorInfo["authorName"] == "string")
                    return authorInfo["authorName"];
            }
        }
    }
    get description() {
        /**@type {Array<string>} */
        let des = [];
        if (this.data.hasOwnProperty("in")) {
            let i = this.data["in"];
            if (typeof i == "string") {
                let l = i.split('\n');
                Array.prototype.push.apply(des, l);
            }
        }
        if (this.data.hasOwnProperty("ind")) {
            let ind = this.data["ind"];
            if (Array.isArray(ind)) {
                Array.prototype.push.apply(des, ind);
            }
        }
        return des.join("<br>")
    }
    get doc() {
        if (this.hasOwnProperty("_doc")) {
            return this._doc;
        }
        return null;
    }
    set doc(doc) {
        if (doc != null && doc.constructor.name == "XMLDocument") {
            /**@type {XMLDocument}*/
            this._doc = doc;
        }
    }
    /**
     * 起点g_data数据
     */
    get g_data() {
        if (this.data.hasOwnProperty("g_data")) {
            let g_data = this.data["g_data"];
            if (g_data != null && typeof g_data == "object") return g_data;
        }
        return null;
    }
    get identifier() {
        let pageJson = this.pageJson;
        if (pageJson) {
            if (pageJson.hasOwnProperty("bookId")) {
                if (pageJson["bookId"] != null) {
                    return { "type": "QIDIAN", "id": "" + pageJson["bookId"], "name": "起点中文网" };
                }
            }
        }
    }
    get lastModifiedDate() {
        let s = new Date().toISOString();
        return s.substr(0, 19) + s.substr(23);
    }
    get metadata() {
        if (!this.doc) {
            let p = new DOMParser();
            var d = p.parseFromString('<metadata xmlns="' + opf + '" xmlns:dc="' + dc + '" xmlns:opf="' + opf + '" />', 'application/xhtml+xml')
            var root = d.documentElement;
        } else {
            var d = this.doc;
            var root = d.createElementNS(opf, "metadata");
        }
        let e = d.createElementNS(dc, "dc:language");
        e.textContent = "zho";
        root.append(e);
        if (this.bookname) {
            let e = d.createElementNS(dc, "dc:title");
            e.textContent = this.bookname;
            root.append(e);
        } else {
            throw Error("Name is needed in EPUB 3.0.");
        }
        let identifier = this.identifier;
        if (identifier) {
            let e = d.createElementNS(dc, "dc:identifier");
            e.textContent = identifier["id"];
            e.setAttribute("opf:scheme", identifier["type"]);
            e.setAttribute("id", "mainIdentifier")
            root.append(e);
            e = d.createElementNS(dc, "dc:publisher");
            e.textContent = identifier["name"];
            root.append(e);
        } else {
            throw Error("Identifier is needed in EPUB 3.0.");
        }
        if (this.source) {
            let e = d.createElementNS(dc, "dc:source");
            e.textContent = this.source;
            root.append(e);
        }
        if (this.creator) {
            let e = d.createElementNS(dc, "dc:creator");
            e.textContent = this.creator;
            e.setAttribute("opf:role", "aut");
            root.append(e);
        }
        e = d.createElement('meta')
        e.setAttribute('property', 'dcterms:modified');
        e.textContent = this.lastModifiedDate;
        root.append(e);
        let tags = this.tags;
        if (tags.length) {
            tags.forEach((tag) => {
                let e = d.createElementNS(dc, "dc:subject");
                e.textContent = tag;
                root.append(e);
            })
        }
        e = d.createElementNS(dc, "dc:contributor");
        e.textContent = "qdbookdownload";
        e.setAttribute("opf:role", "bkp");
        root.append(e);
        let des = this.description;
        if (des.length) {
            let e = d.createElementNS(dc, "dc:description");
            e.textContent = des;
            root.append(e);
        }
        return root;
    }
    /**
     * 起点pageJson数据
     */
    get pageJson() {
        let g_data = this.g_data;
        if (g_data) {
            if (g_data.hasOwnProperty("pageJson")) {
                let pageJson = g_data["pageJson"];
                if (pageJson != null && typeof pageJson == "object") return pageJson;
            }
        }
        return null;
    }
    get source() {
        let pageJson = this.pageJson;
        if (pageJson) {
            if (pageJson.hasOwnProperty("bookId")) {
                if (pageJson["bookId"] != null) {
                    return "https://book.qidian.com/info/" + pageJson["bookId"];
                }
            }
        }
    }
    get tags() {
        /**@type {Array<string>}*/
        let tags = [];
        if (this.data.hasOwnProperty("tag")) {
            let tag = this.data["tag"];
            if (Array.isArray(tag)) {
                tag.forEach((v) => {
                    if (v.hasOwnProperty("c")) {
                        tags.push(v["c"]);
                    }
                })
            }
        }
        if (this.data.hasOwnProperty("atag")) {
            let atag = this.data["atag"];
            if (Array.isArray(atag)) {
                Array.prototype.push.apply(tags, atag);
            }
        }
        return tags
    }
}
/**
 * @typedef {"cover-image"|"mathml"|"nav"|"remote-resources"|"scripted"|"svg"|"switch"} ManifestProperties
 * @type {Array<ManifestProperties>}
 */
let ManifestPropertiesList = ["cover-image", "mathml", "nav", "remote-resources", "scripted", "svg", "switch"]
/**
 * @typedef {"page-spread-left"|"page-spread-right"} SpineProperties
 * @type {Array<SpineProperties>}
 */
let SpinePropertiesList = ["page-spread-left", "page-spread-right"]
/**
 * @typedef {"image/gif"|"image/jpeg"|"image/png"|"image/svg+xml"|"image/webp"} ImgMimeType
 * @type {Array<ImgMimeType>}
 */
let supportedImgMimeType = ["image/gif", "image/jpeg", "image/png", "image/svg+xml", "image/webp"]
Object.freeze(ManifestPropertiesList);
Object.freeze(SpinePropertiesList);
Object.freeze(supportedImgMimeType);
class EPUBXHtml {
    /**
     * @typedef {{href: string, id: string, properties: Array<ManifestProperties>|string?, linear: boolean?, spineProp: SpineProperties?}} EPUBXHTMLd
     * @param {EPUBXHTMLd} obj
     */
    constructor(obj) {
        /**@type {EPUBXHTMLd}*/
        this.data = {}
        Object.assign(this.data, obj);
        this.test();
    }
    /**
     * @param {XMLDocument} d
     * @param {HTMLElement} target
     */
    addToXML(d, target) {
        if (d.getElementById(this.id)) throw Error("Already have same id.")
        let e = d.createElementNS(opf, "item");
        e.setAttribute("href", this.href);
        e.setAttribute("id", this.id);
        e.setAttribute('media-type', 'application/xhtml+xml');
        let p = this.properties;
        if (p) e.setAttribute("properties", p);
        target.append(e);
    }
    /**
     * @param {XMLDocument} d
     * @param {HTMLElement} target
     */
    addToSpine(d, target) {
        let p = this.propertieslist;
        if (p.indexOf("nav") > -1) return;
        if (!d.getElementById(this.id)) throw Error("Can not find this id.")
        let e = d.createElementNS(opf, "itemref");
        e.setAttribute("idref", this.id);
        e.setAttribute("linear", this.linear);
        if (this.spineProp) e.setAttribute("spineProp", this.spineProp);
        target.append(e);
    }
    get href() {
        return this.data["href"];
    }
    get linear() {
        if (this.data.hasOwnProperty("linear") && this.data["linear"] != null) {
            return this.data["linear"] ? "yes" : "no";
        }
        return "yes"
    }
    get id() {
        return this.data["id"];
    }
    get propertieslist() {
        /**@type {Array<ManifestProperties>}*/
        let p = []
        if (this.data.hasOwnProperty("properties")) {
            let pro = this.data["properties"]
            if (typeof pro == "string") {
                pro = pro.split(" ");
            }
            if (Array.isArray(pro)) {
                pro.forEach((key) => {
                    if (ManifestPropertiesList.indexOf(key) > -1) {
                        p.push(key);
                    }
                })
            }
        }
        return p;
    }
    get properties() {
        let p = this.propertieslist;
        let s = p.join(" ");
        return s.length ? s : null;
    }
    get spineProp() {
        if (this.data.hasOwnProperty("spineProp")) {
            let s = this.data["spineProp"];
            if (typeof s == "string" && s.length) {
                if (SpinePropertiesList.indexOf(s) > -1) return s;
            }
        }
        return null;
    }
    /**判断是否有误*/
    test() {
        if (!this.data.hasOwnProperty("href")) throw Error("Need href.")
        if (typeof this.data["href"] != "string" || !this.data["href"].length) throw Error("href have wrong type or is empty.")
        if (!this.data.hasOwnProperty("id")) throw Error("Need id.");
        if (typeof this.data["id"] != "string" || !this.data["id"].length) throw Error("id have wrong type or is empty.")
    }
}
class EPUBImg {
    /**
     * @typedef {{href: string, id: string, properties: Array<ManifestProperties>|string?, mimetype: ImgMimeType?}} EPUBImgd
     * @param {EPUBImgd} obj
     */
    constructor(obj) {
        /**@type {EPUBImgd}*/
        this.data = {}
        Object.assign(this.data, obj);
        this.test();
    }
    /**
     * @param {XMLDocument} d
     * @param {HTMLElement} target
     */
    addToXML(d, target) {
        if (d.getElementById(this.id)) throw Error("Already have same id.")
        let e = d.createElementNS(opf, "item");
        e.setAttribute("href", this.href);
        e.setAttribute("id", this.id);
        e.setAttribute('media-type', this.mimetype);
        let p = this.properties;
        if (p) e.setAttribute("properties", p);
        target.append(e);
    }
    get href() {
        return this.data["href"];
    }
    get id() {
        return this.data["id"];
    }
    get mimetype() {
        if (this.data.hasOwnProperty("mimetype")) {
            let m = this.data["mimetype"];
            if (supportedImgMimeType.indexOf(m) > -1) return m;
        }
        return supportedImgMimeType[1];
    }
    get propertieslist() {
        /**@type {Array<ManifestProperties>}*/
        let p = []
        if (this.data.hasOwnProperty("properties")) {
            let pro = this.data["properties"]
            if (typeof pro == "string") {
                pro = pro.split(" ");
            }
            if (Array.isArray(pro)) {
                pro.forEach((key) => {
                    if (ManifestPropertiesList.indexOf(key) > -1) {
                        p.push(key);
                    }
                })
            }
        }
        return p;
    }
    get properties() {
        let p = this.propertieslist;
        let s = p.join(" ");
        return s.length ? s : null;
    }
    /**判断是否有误*/
    test() {
        if (!this.data.hasOwnProperty("href")) throw Error("Need href.")
        if (typeof this.data["href"] != "string" || !this.data["href"].length) throw Error("href have wrong type or is empty.")
        if (!this.data.hasOwnProperty("id")) throw Error("Need id.");
        if (typeof this.data["id"] != "string" || !this.data["id"].length) throw Error("id have wrong type or is empty.")
    }
}
class EPUBManifest {
    constructor(doc) {
        this.list = [];
        this.doc = doc;
        this.addedNav = false;
    }
    addNav() {
        let founded = false
        for (let i = 0; i < this.list.length; i++) {
            if (this.list[i].constructor == EPUBXHtml) {
                founded = true;
                break;
            }
        }
        if (founded) {
            this.list.push(new EPUBXHtml({ "href": "navigation-documents.xhtml", "id": "toc", "properties": ["nav"] }))
            this.addedNav = true;
        }
    }
    append(o) {
        if (o == null) return;
        if (o.constructor == EPUBXHtml) {
            this.list.push(o);
        } else if (o.constructor == EPUBImg) {
            this.list.push(o);
        }
    }
    get doc() {
        if (this.hasOwnProperty("_doc")) {
            return this._doc;
        }
        return null;
    }
    set doc(doc) {
        if (doc != null && doc.constructor.name == "XMLDocument") {
            /**@type {XMLDocument}*/
            this._doc = doc;
        }
    }
    get manifest() {
        if (!this.addedNav) this.addNav();
        if (!this.doc) {
            let p = new DOMParser();
            var d = p.parseFromString('<manifest/>', 'application/xhtml+xml')
            var root = d.documentElement;
        } else {
            var d = this.doc;
            var root = d.createElementNS(opf, "manifest");
        }
        this.list.forEach((v) => {
            if (v.constructor == EPUBXHtml) {
                v.addToXML(d, root);
            } else if (v.constructor == EPUBImg) {
                v.addToXML(d, root);
            }
        })
        return root;
    }
    get pageMap() {
        let p = new DOMParser();
        let d = p.parseFromString('<?xml version="1.0" encoding="UTF-8" ?><page-map xmlns="' + opf + '"/>', 'application/xml');
        let root = d.documentElement;
        let i = 1;
        this.list.forEach((v) => {
            if (v.constructor == EPUBXHtml) {
                if (v.propertieslist.indexOf("nav") == -1) {
                    let e = d.createElementNS(opf, "page");
                    e.setAttribute("name", i++);
                    e.setAttribute("href", v.href);
                    root.append(e);
                }
            }
        })
        let s = new XMLSerializer()
        return s.serializeToString(d);
    }
    get spine() {
        if (!this.doc) {
            let p = new DOMParser();
            var d = p.parseFromString('<spine page-map="_page_map_"/>', 'application/xhtml+xml')
            var root = d.documentElement;
        } else {
            var d = this.doc;
            var root = d.createElementNS(opf, "spine");
            root.setAttribute('page-map', '_page_map_');
        }
        this.list.forEach((v) => {
            if (v.constructor == EPUBXHtml) {
                v.addToSpine(d, root);
            }
        })
        return root;
    }
}
class EPUBFile {
    constructor(href, blob) {
        if (typeof href != "string") throw ("Unknown href");
        this.href = href;
        if (blob == null) throw ("Not content");
        else if (typeof blob == "string") {
            this.blob = new Blob([blob], { "type": "application/xhtml+xml; charset=UTF-8" });
        } else if (blob.constructor.name == "Blob") {
            this.blob = blob;
        } else {
            throw ("Unknown Content.")
        }
    }
    addToJSZip(zip) {
        zip.file("item/" + this.href, this.blob);
    }
}
class EPUBTextFile extends EPUBFile {
    constructor(href, d, meta) {
        super(href, "temp");
        this.d = d;
        let s = this.toXML(meta);
        this.blob = new Blob([s], { "type": "application/xhtml+xml; charset=UTF-8" });
    }
    get chapterName() {
        if (this.d.hasOwnProperty("n")) {
            let n = this.d["n"]
            if (typeof n == "string" && n.length) return n
        } else if (this.d.hasOwnProperty("t")) {
            let n = this.d["t"]
            if (typeof n == "string") return n;
        }
        return null;
    }
    get content() {
        /**@type {Array<string>}*/
        let r = []
        if (this.d.hasOwnProperty("c")) {
            let c = this.d["c"]
            if (Array.isArray(c)) {
                Array.prototype.push.apply(r, c);
            }
        }
        return r;
    }
    get isVIPVolume() {
        if (this.d.hasOwnProperty("vip")) {
            let vip = this.d["vip"]
            if (vip != null) {
                return vip ? true : false;
            }
        }
        return null;
    }
    get notbuy() {
        if (this.d.hasOwnProperty("notbuy")) {
            let nb = this.d["notbuy"]
            if (nb != null) {
                return nb ? true : false;
            }
        }
        return null;
    }
    get totalChapterCount() {
        if (this.d.hasOwnProperty("tc")) {
            let tc = this.d["tc"];
            if (typeof tc == "number") {
                return tc;
            }
        }
        return null;
    }
    get totalWords() {
        if (this.d.hasOwnProperty("tw")) {
            let tw = this.d["tw"];
            if (typeof tw == "number") {
                return tw;
            }
        }
        return null;
    }
    toXML(meta) {
        let p = new DOMParser();
        let d = p.parseFromString('<?xml version="1.0" encoding="UTF-8" standalone="no"?><html xmlns="http://www.w3.org/1999/xhtml" xml:lang="zh-CN"><head/><body/></html>', 'application/xhtml+xml')
        let e = d.createElement('meta');
        e.setAttribute('charset', "UTF-8")
        d.head.append(e);
        if (meta != null && meta.constructor == EPUBMeta) {
            let bn = meta.bookname;
            if (bn) {
                let e = d.createElement('title');
                e.innerText = bn;
                d.head.append(bn);
            }
        }
        let c = this.chapterName;
        if (c != null) {
            let e = d.createElement('p');
            let e2 = d.createElement('h1');
            e2.style.textAlign = "center";
            e2.innerHTML = c;
            e.append(e2);
            d.body.append(e);
        }
        let tc = this.totalChapterCount;
        if (tc != null) {
            let e = d.createElement('p');
            e.style.fontSize = '80%';
            e.append('总章节数：')
            let e2 = d.createElement('span');
            e2.innerText = tc;
            e2.style.fontWeight = "bold";
            e.append(e2);
            d.body.append(e);
        }
        let tw = this.totalWords;
        if (tw != null) {
            let e = d.createElement('p');
            e.style.fontSize = '80%';
            e.append('总字数：')
            let e2 = d.createElement('span');
            e2.innerText = tw;
            e2.style.fontWeight = "bold";
            e.append(e2);
            d.body.append(e);
        }
        let vip = this.isVIPVolume;
        if (vip) {
            let e = d.createElement('p');
            e.style.fontSize = '80%';
            e.append(vip ? "VIP卷" : "非VIP卷")
            d.body.append(e);
        }
        let w = this.word;
        if (w != null) {
            let e = d.createElement('p');
            e.style.fontSize = '80%';
            e.append('字数：')
            let e2 = d.createElement('span');
            e2.innerText = w;
            e2.style.fontWeight = "bold";
            e.append(e2);
            d.body.append(e);
        }
        let u = this.uploadTime;
        if (u != null) {
            let e = d.createElement('p');
            e.style.fontSize = '80%';
            e.append('上传时间：')
            let e2 = d.createElement('span');
            e2.innerText = u;
            e2.style.fontWeight = "bold";
            e.append(e2);
            d.body.append(e);
        }
        let nb = this.notbuy;
        if (nb) {
            let e = d.createElement('p');
            e.style.fontSize = '80%';
            e.append("未购买章节");
            d.body.append(e);
        }
        let l = this.content;
        l.forEach((t) => {
            let e = d.createElement('p');
            e.innerText = t;
            d.body.append(e);
        })
        let s = new XMLSerializer()
        return s.serializeToString(d);
    }
    get uploadTime() {
        if (this.d.hasOwnProperty("u")) {
            let u = this.d["u"]
            if (typeof u == "string" && u.length) return u;
        }
        return null;
    }
    get word() {
        if (this.d.hasOwnProperty("w")) {
            let w = this.d["w"]
            if (typeof w == "number") return w
        }
        return null;
    }
}
class EPUBXHtmlNode {
    /**
     * XHTML节点树
     * @param {boolean} isRoot 是否为根节点
     * @param {EPUBMeta} data meta
     * @param d 字典
     * @param {string} href 只有非根节点有效，位置信息
     */
    constructor(isRoot, data, d, href) {
        this.root = isRoot ? true : false;
        Object.freeze(this.root);
        if (data != null && data.constructor == EPUBMeta) {
            this.metadata = data;
        }
        if (!this.root) {
            this.data = d;
            this.href = href;
            this.file = new EPUBTextFile(href, d, this.metadata);
        }
        /**@type {Array<EPUBXHtmlNode>}*/
        this.childList = []
    }
    addToJSZip(zip) {
        if (!this.root) {
            this.file.addToJSZip(zip);
        }
        this.childList.forEach((n) => {
            n.addToJSZip(zip);
        })
    }
    /**
     * 将另一个节点添加为子节点
     * @param {EPUBXHtmlNode} node 
     */
    append(node) {
        if (node != null && node.constructor == EPUBXHtmlNode) {
            if (node.root) throw Error("Can't add a root node to childlist.")
            if (this.childList.indexOf(node) > -1) throw Error('Already in childlist.')
            let i = this.childHrefList.indexOf(node.href);
            if (i > -1) {
                console.log("prevent same append:", node);
                return this.childList[i];
            }
            this.childList.push(node);
            node.parent = this;
        }
    }
    get childHrefList() {
        /**@type {Array<string>} */
        let l = [];
        this.childList.forEach((v)=>{
            l.push(v.href)
        })
        return l;
    }
    gendoc() {
        if (this.root) {
            let p = new DOMParser();
            let d = p.parseFromString('<?xml version="1.0" encoding="UTF-8" standalone="no"?><html xmlns="http://www.w3.org/1999/xhtml" xml:lang="zh-CN"><head/><body/></html>', 'application/xhtml+xml');
            this.doc = d;
            let e = d.createElement('meta');
            e.setAttribute('charset', 'UTF-8')
            d.head.append(e)
            e = d.createElement('title');
            e.innerText = "Navigation"
            d.head.append(e)
        }
    }
    generateNav() {
        if (this.root) {
            this.gendoc()
            let d = this.doc;
            d.body.innerHTML = '<nav xmlns:epub="http://www.idpf.org/2007/ops" epub:type="toc" id="toc" />'
            let nav = d.body.children[0];
            let m = this.meta;
            if (m) {
                let bn = m.bookname;
                if (bn) {
                    let e = d.createElement('h1')
                    e.innerText = bn;
                    nav.append(e);
                }
            }
            if (!this.childList.length) {
                throw Error('No any contents')
            }
            let ol = d.createElement('ol');
            nav.append(ol);
            this.childList.forEach((node) => {
                node.genlist(d, ol);
            })
            let s = new XMLSerializer()
            return s.serializeToString(d);
        }
        return null;
    }
    /**
     * 生成li
     * @param {XMLDocument} d 
     * @param {HTMLOListElement} ol 父OL
     */
    genlist(d, ol) {
        if (!this.root) {
            let li = d.createElement('li');
            ol.append(li);
            let a = d.createElement('a');
            a.href = this.href;
            let t = this.title;
            a.innerText = t ? t : "未知";
            li.append(a);
            if (this.childList.length) {
                let ol = d.createElement('ol');
                li.append(ol);
                this.childList.forEach((node) => {
                    node.genlist(d, ol);
                })
            }
        }
    }
    get meta() {
        if (this.hasOwnProperty("metadata")) {
            let m = this.metadata;
            if (m != null && m.constructor == EPUBMeta) return m
        }
        return null
    }
    get parent() {
        if (!this.root && this.hasOwnProperty("_parent")) {
            let p = this._parent;
            if (p != null && p.constructor == EPUBXHtmlNode) {
                return p
            }
        }
        return null
    }
    set parent(p) {
        if (!this.root && p != null && p.constructor == EPUBXHtmlNode) {
            this._parent = p;
        } else if (!this.root && p == null) {
            this._parent = null;
        }
    }
    get title() {
        if (!this.root && this.hasOwnProperty("data")) {
            if (this.data.hasOwnProperty("n")) {
                let n = this.data["n"]
                if (typeof n == "string") return n;
            } else if (this.data.hasOwnProperty("t")) {
                let n = this.data["t"]
                if (typeof n == "string") return n;
            }
        }
        return null;
    }
}
class EPUBFileList {
    constructor() {
        /**@type {Array<EPUBFile|EPUBTextFile>}*/
        this.list = [];
    }
    append(file) {
        if (file.constructor == EPUBFile || file.constructor == EPUBTextFile) {
            this.list.push(file)
        }
    }
    addToJSZip(zip) {
        this.list.forEach((v) => {
            v.addToJSZip(zip);
        })
    }
}
class EPUB {
    /**@param {Blob} img*/
    addCoverImg(img) {
        let href = "image/cover.jpg"
        this.files.append(new EPUBFile(href, img))
        this.manifest.append(new EPUBImg({href: href, id: "cover", properties: ["cover-image"]}))
    }
    appendXHtmlNode(i, j, d, node) {
        if (node == null) {
            let href = i + "/root.xhtml"
            let child = new EPUBXHtmlNode(false, this.meta, d, href)
            let r = this.root.append(child);
            if (r != undefined) {
                return r;
            }
            this.manifest.append(new EPUBXHtml({ href: href, id: i + "_root" }))
            return child;
        } else if (node.constructor == EPUBXHtmlNode) {
            let href = i + "/" + j + ".xhtml"
            let child = new EPUBXHtmlNode(false, this.meta, d, href)
            let r = node.append(child);
            if (r != undefined) {
                return r;
            }
            this.manifest.append(new EPUBXHtml({ href: href, id: i + "_" + j }))
            return child;
        }
    }
    constructor(meta) {
        this.data = {};
        if (meta == null || meta.constructor != EPUBMeta) {
            this.meta = new EPUBMeta(meta);
        }
        this.manifest = new EPUBManifest();
        this.root = new EPUBXHtmlNode(true, this.meta);
        this.files = new EPUBFileList();
    }
    gendoc() {
        let p = new DOMParser();
        this.doc = p.parseFromString('<?xml version="1.0" encoding="UTF-8" standalone="no"?><package xmlns="' + opf + '" xmlns:dc="' + dc + '" unique-identifier="mainIdentifier" version="3.0" xml:lang="zh-cn" />', 'application/xml')
    }
    /**@returns {Promise<Uint8Array>}*/
    generate() {
        let zip = new JSZip();
        zip.file("mimetype", new Blob(["application/epub+zip"], { "type": "text/plain; charset: UTF-8" }))
        zip.file("META-INF/container.xml", new Blob(['<?xml version="1.0"?><container version="1.0" xmlns="urn:oasis:names:tc:opendocument:xmlns:container"><rootfiles><rootfile full-path="item/volume.opf" media-type="application/oebps-package+xml" /></rootfiles></container>'], { "type": "application/xml; charset: UTF-8" }))
        zip.file("item/volume.opf", new Blob([this.generateOPF()], { "type": "application/oebps-package+xml; charset: UTF-8" }))
        zip.file("item/_page_map_.xml", new Blob([this.generatePageMap()], { "type": "application/xml; charset: UTF-8" }))
        zip.file("item/navigation-documents.xhtml", new Blob([this.generateNav()], { "type": "application/xhtml+xml; charset: UTF-8" }))
        this.files.addToJSZip(zip)
        this.root.addToJSZip(zip)
        return zip.generateAsync({ type: "uint8array", compression: "DEFLATE" })
    }
    generateNav() {
        return this.root.generateNav();
    }
    generateOPF() {
        this.gendoc();
        this.meta.doc = this.doc;
        let root = this.doc.children[0];
        root.append(this.meta.metadata);
        this.manifest.doc = this.doc;
        root.append(this.manifest.manifest);
        root.append(this.manifest.spine);
        let s = new XMLSerializer()
        return s.serializeToString(this.doc);
    }
    generatePageMap() {
        return this.manifest.pageMap;
    }
    get meta() {
        if (this.data.hasOwnProperty("meta")) {
            if (this.data["meta"].constructor == EPUBMeta) {
                return this.data["meta"]
            }
        }
        throw Error("Can not get metadata.")
    }
    set meta(meta) {
        if (meta == null) return;
        if (meta.constructor == EPUBMeta) {
            this.data["meta"] = meta;
        }
    }
}
