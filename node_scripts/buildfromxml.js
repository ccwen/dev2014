var outback = function (s) {
    while (s.length < 70) s += ' ';
    var l = s.length; 
    for (var i = 0; i < l; i++) s += String.fromCharCode(8);
    process.stdout.write(s);
}
var movefile=function(sourcefn,targetfolder) {
	var fs = require("fs");
	var source = fs.createReadStream(sourcefn);
	var path=require("path");
	var targetfn=path.resolve(process.cwd(),"..")+path.sep+path.basename(sourcefn);
	var destination = fs.createWriteStream(targetfn);
	console.log(targetfn);
	source.pipe(destination, { end: false });
	source.on("end", function(){
	    fs.unlinkSync(sourcefn);
	});
	return targetfn;
}
var fs=require("fs");
var mkdbjs="mkdb.js";
var build=function(path){
  if (!fs.existsSync(mkdbjs)) {
      throw "no "+mkdbjs  ;
  }
  var fn=require("path").resolve(path,mkdbjs);
  var setting=require(fn);
  console.log(setting,fn);
  
  return;
  path=path||".";
  var indexer=require("ksana-document").indexer;

  var getstatus=function() {
    var status=indexer.status();
    outback((Math.floor(status.progress*1000)/10)+'%'+status.message);
    if (status.done) {
      status.outputfn=movefile(status.outputfn,"..");
      clearInterval(timer);
    }
  }

  var session=indexer.start(path);
  if (!session) {
    console.log("No file to index");
    return;
  }
  var timer=setInterval( getstatus, 1000);
}

module.exports=build;