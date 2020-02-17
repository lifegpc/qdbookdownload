console.log('save.log')
var b;
chrome.runtime.onMessage.addListener(function(message, sender,sendResponse)
{
    if(message.action=="savetxt"&&b==undefined)
    {
        b=new Blob([message.b], {type: 'text/plain'});
        saveAs(b,message.name+".txt");
        sendResponse(1);
        var blobUrl = URL.createObjectURL(b);
        var link = document.createElement("a");
        link.href = blobUrl;
        link.download = message.name+".txt";
        link.innerHTML = "点击这里也可以保存";
        document.body.appendChild(link); 
    }
});
