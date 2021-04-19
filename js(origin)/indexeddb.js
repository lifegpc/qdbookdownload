let indexedReq = indexedDB.open("tempfile")
/**@type {IDBDatabase}*/
let db = null;
indexedReq.onupgradeneeded = function (event) {
    /**@type {IDBVersionChangeEvent} */
    let ev = event;
    let db = this.result;
    if (ev.newVersion > 0) {
        db.createObjectStore("file")
    }
}
indexedReq.onsuccess = function (event) {
    db = this.result;
}
function clearTempfileDb() {
    if (db == null) {
        setTimeout(clearTempfileDb, 1000);
        return;
    }
    let tr = db.transaction("file", "readwrite");
    let file = tr.objectStore("file");
    let r = file.clear();
    return new Promise((o, j) => {
        r.onerror = (ev) => {j(ev)}
        r.onsuccess = (ev) => {o(ev)}
    })
}
/**
 * @param {string} id
 * @param {Blob} blob
 * @param {string} name
 */
function sendFile(id, blob, name) {
    let tr = db.transaction("file", "readwrite");
    let file = tr.objectStore("file");
    file.add(blob, id);
    return new Promise((o) => {
        chrome.runtime.sendMessage({ action: "savefile", id: id, name: name }, function (data) {
            o(data);
        })
    })
}
function reciveFile(id) {
    if (db == null) {
        return new Promise((o, j) => {
            setTimeout(() => {
                reciveFile(id).then((d) => { o(d) }).catch((d) => { j(d) }, 100);
            })
        })
    }
    let tr = db.transaction("file", "readwrite");
    let file = tr.objectStore("file");
    let r = file.get(id);
    return new Promise((o, j) => {
        r.onerror = (ev) => { j(ev) };
        r.onsuccess = (ev) => {
            let b = r.result;
            let tr = db.transaction("file", "readwrite");
            let file = tr.objectStore("file");
            file.delete(id);
            o(b);
        }
    })
}
