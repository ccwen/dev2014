var jsonp=function(url,dbid,callback,context) {
  var script=document.getElementById("jsonp");
  if (script) {
    script.parentNode.removeChild(script);
  }
  script=document.createElement('script');
  script.setAttribute('id', "jsonp");
  document.getElementsByTagName('head')[0].appendChild(script); 

  window.jsonp_handler=function(data) {
    data.dbid=dbid;
    callback.apply(context,[data]);
  }
  script.setAttribute('src', url+'?"'+(new Date())+'"');
}

var needToUpdate=function(fromjson,tojson) {
  var needUpdates=[];
  for (var i=0;i<fromjson.length;i++) {
    var to=tojson[i];
    var from=fromjson[i];
    var newfiles=[],newfilesizes=[],removed=[];
    from.filedates.map(function(f,idx){
      var newidx=to.files.indexOf( from.files[idx]);
      if (newidx==-1) {
        //file removed in new version
        removed.push(from.files[idx]);
      } else {
        if (f<to.filedates[newidx]) {
          newfiles.push( to.files[newidx] );
          newfilesizes.push(to.filesizes[newidx]);
        }        
      }
    });
    if (newfiles.length) {
      from.newfiles=newfiles;
      from.newfilesizes=newfilesizes;
      from.removed=removed;
      needUpdates.push(from);
    }
  }
  return needUpdates;
}
var getUpdatables=function(apps,cb,context) {
  getRemoteJson(apps,function(jsons){
    var hasUpdates=needToUpdate(apps,jsons);
    cb.apply(context,[hasUpdates]);
  },context);
}
var getRemoteJson=function(apps,cb,context) {
  var taskqueue=[],output=[];
  var makecb=function(path){
    return function(data){
        if (!(data && typeof data =='object' && data.__empty)) output.push(data);
        var url=(path.url||"http://127.0.0.1:8080/"+path.dbid) +"/ksana.js";
        jsonp( url ,path.dbid,taskqueue.shift(), context);
    };
  };
  apps.forEach(function(app){taskqueue.push(makecb(app))});

  taskqueue.push(function(data){
    output.push(data);
    cb.apply(context,[output]);
  });

  taskqueue.shift()({__empty:true}); //run the task
}

var liveupdate={ needToUpdate: needToUpdate , jsonp:jsonp, getUpdatables:getUpdatables};
module.exports=liveupdate;