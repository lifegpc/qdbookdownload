console.log('save.log')
var b;
chrome.runtime.onMessage.addListener(function (message, sender, sendResponse) {
    if (message.action == "savefile" && b == undefined) {
        reciveFile(message.id).then((b) => {
            saveAs(b, message.name);
            sendResponse(1);
            var blobUrl = URL.createObjectURL(b);
            var link = document.createElement("a");
            link.href = blobUrl;
            link.download = message.name;
            link.innerHTML = "点击这里也可以保存";
            document.body.appendChild(link);
        })
    }
});
