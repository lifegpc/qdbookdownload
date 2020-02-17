console.log('taskmanage.js');
{function t()//更新数据
{
    chrome.runtime.sendMessage({action:"getruninfod"},function(data)
    {
        var tbody=document.getElementById('manage');
        tbody.innerHTML='';
        for(var i=0;i<data.length;i++)
        {
            tbody.append(getdata(data[i],i));
        }
    });
    setTimeout(t,2000);
}
function getdata(inp,j)
{
    var tr=document.createElement('tr');
    var td;
    for(var i=0;i<8;i++)
    {
        td=document.createElement('td');
        if((i+j)%2)td.className="a";else td.className="b";
        td.innerText=inp[i]
        tr.append(td);
    }
    td=document.createElement('td');
    var te=""
    if((8+j)%2)te="a";else te="b";
    td.className=te+" l";
    var div=document.createElement('div');
    div.innerText="停止";
    div.setAttribute('i',j);
    div.addEventListener('click',function(j){s(j)});
    td.append(div);
    tr.append(td);
    return tr;
}
t();
}
function s(i)
{
    chrome.runtime.sendMessage({i:i.srcElement.getAttribute('i')-1+1,action:"taskstop"},function(data){if(data==1){alert('发送停止请求成功。')}});
}
