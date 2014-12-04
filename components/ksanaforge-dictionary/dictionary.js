var kde=Require("ksana-document").kde;
var kse=Require("ksana-document").kse;

var indexOfSorted = function (array, obj) { 
  var low = 0,
  high = array.length-1;
  while (low < high) {
    var mid = (low + high) >> 1;
    array[mid] < obj ? low = mid + 1 : high = mid;
  }
  return low;
};
var exhaustiveFind=function(str,dictionary){
    var res=[];

    for (var i=0;i<str.length;i++){
        for (var j=i;j<str.length;j++) {
            var substr=str.substr(i,j+1);
            var p=indexOfSorted(dictionary,substr);
            if (dictionary[p]==substr) {
                if (res.indexOf(dictionary[p])==-1){
                    res.push(dictionary[p]);
                }
            }
        }
    }
    res.sort(function(a,b){return b.length-a.length});
    return res;
}

var fetchDefinations=function(db,pages,cb,context) {
    var taskqueue=[],output=[];

    var makecb=function(pf){
        return function(data){
            if (!(data && typeof data =='object' && data.__empty)) output.push(data);
            kse.highlightPage(db,pf.file,pf.page+1,{},taskqueue.shift());
        };
    };
    pages.forEach(function(pf){taskqueue.push(makecb(pf))});

    taskqueue.push(function(data){
        output.push(data);

        var output2="";
        output.map(function(o){
            output2+= "<h4>"+o.pagename+"</h4>"+o.text.replace(/<.*?>/g,'')+"<br/>";
        });
        cb.apply(context,[output2]);
    });

    taskqueue.shift()({__empty:true}); //run the task
}
var findPossibleByString=function(str,dictionaries,cb,context) {
    var res={},pages=[];
    //TODO accept multiple dictionary
    if (!dictionaries || dictionaries.length==0) {
        cb.apply(context,[null]);
        return;
    }
    kde.open(dictionaries[0],function(db){
        var entries=db.get("pageNames");
        if (!db.entries) {
            db.entries=entries.slice(0);
            db.entries.sort();
        }
        res.dic=exhaustiveFind(str,db.entries);
        for (var i=0;i<res.dic.length;i++) {
            pages.push(db.findPage(res.dic[i])[0]);
        }
        fetchDefinations(db,pages,cb,context);
    });
}
var validEntryChar=function(str) {
    var c=str.charCodeAt(0);
    return (c==0x13 ||c==0x20|| (c>=0x3400&&c<0x9fff) || (c>=0xd800&&c<=0xdfff));
}
var findPossible=function(obj,dictionaries,cb,context) {
    var str="";
    if (typeof obj!="string" && obj.innerHTML) {
        while (obj) {
            if (!obj.innerHTML) {
                obj=obj.nextSibling;
                continue;
            }
            if (!validEntryChar(obj.innerHTML)) break;
            str+=obj.innerHTML.trim();
            obj=obj.nextSibling;
        }
    } else str=obj;
    setTimeout(function(){
        findPossibleByString(str,dictionaries,cb,context);
    },1);
}
module.exports={findPossible:findPossible};