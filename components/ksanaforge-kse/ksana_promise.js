var ksana=require('./ksana');
var $ksana=function(api,opts) {
    if (typeof ksana[api]!=='function') {
      throw api+' not found';
      return;
    }
    var deferred = new jQuery.Deferred();
    var promise=deferred.promise();
    var that=this;

    ksana[api](opts,function(err,data){
      if (err) deferred.fail(err);
      else deferred.resolveWith(that,[data]);
      deferred.always(err);
    });

    return promise;
};
module.exports=$ksana;