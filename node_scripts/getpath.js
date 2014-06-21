
var Kdb=require("ksana-document").kdb;

var fs=require("fs");
var get=function(path,recursive,cb) {
	var paths=path.split(".");
	var fn=paths.shift()+".kdb";

	if (!fs.existsSync(fn)) {
		throw "db "+fn+" not found";
		return;
	}
	var db=Kdb(fn);
	console.log("getting",paths,"from",fn);
	//if (paths.length==0) paths=["meta"];
	db.get(paths,recursive,cb);
}
module.exports=get;