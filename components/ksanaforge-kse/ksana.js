
var Ksana=function(){
  ksana.services={};
  var makeinf=function(name) {
      var service=null;
      for (var i in ksana.services) {
        if (ksana.services[i][name]) service=ksana.services[i]
      }
      if (!service) throw 'api not found '+name;

      return function(opts,callback) {
              var handler=service[name];
              if (handler.async) {
                handler(opts,callback);
              } else {
                var data=handler(opts);
                //this line is not really needed.
                setTimeout( function() { callback(0,data) }, 0);        
              }
      }
  }  
  var makeprepare=function(opts) {
      return function(opts,callback) {
        ksana.services.yase.prepare(opts,function(err,data){
          callback(err,data);
        })
      };
  }


  if (ksana.platform=='node-webkit' || ksana.platform=='chrome') {
    /* compatible async interface for browser side js code*/
    /*
    var api_yadb=nodeRequire('yadb').api;
    api_yadb(ksana.services);
    var api_yase=nodeRequire('yase').api ; 
    api_yase(ksana.services); 
    */
    var api_document=nodeRequire('ksana-document').api;
    api_document(ksana.services);

    return { //turn into async, for compatible with node_server
    /*      
        phraseSearch: makeinf('phraseSearch'),
        boolSearch: makeinf('boolSearch'),
        search: makeinf('search'),
        getTermVariants: makeinf('getTermVariants'),
        getText: makeinf('getText'),
        getTextByTag: makeinf('getTextByTag'),
        getTextRange:makeinf('getTextRange'),
        getTagInRange: makeinf('getTagInRange'),
        closestTag: makeinf('closestTag'),
        buildToc: makeinf('buildToc'),
        getTagAttr: makeinf('getTagAttr'),
        fillText: makeinf('fillText'),
        getRange: makeinf('getRange'),
        getRaw: makeinf('getRaw'),
        getBlob: makeinf('getBlob'),
        findTag: makeinf('findTag'),
        expandToken: makeinf('expandToken'),
        
        findTagBySelectors: makeinf('findTagBySelectors'),
        exist: makeinf('exist'),
        keyExists: makeinf('keyExists'),
        customfunc: makeinf('customfunc'),
       // version: services["yase"].version(),

        enumLocalYdb:makeinf('enumLocalYdb'),
        sameId:makeinf('sameId'),
        prepare:makeprepare(),
      */
        //document services
        enumProject:makeinf('enumProject'),
        enumKdb:makeinf('enumKdb'),
        getProjectFolders:makeinf('getProjectFolders'),
        getProjectFiles:makeinf('getProjectFiles'),
        loadDocumentJSON:makeinf('loadDocumentJSON'),
        saveMarkup:makeinf('saveMarkup'),
        saveDocument:makeinf('saveDocument'),
        getUserSettings:makeinf('getUserSettings'),
        login:makeinf('login'),
        buildIndex:makeinf('buildIndex'),
        buildStatus:makeinf('buildStatus'),
        stopIndex:makeinf('stopIndex'),
        get:makeinf("get"),
        search:makeinf("search")
    };  

  } else {
    //cannot call document services in server mode
    //for node_server , use socket.io to talk to server-side yase_api.js
    //var api=require('./rpc_yase');
    return require('./rpc_document');
  }
}

module.exports=Ksana();