
var Kdb=require("ksana-document").kdb;

var fs=require("fs");
var get=function(path,cb) {
	var paths=path.split(".");
	var fn=paths.shift()+".kdb";

	if (!fs.existsSync(fn)) {
		throw "db "+fn+" not found";
		return;
	}
	var db=Kdb(fn);
	console.log("getting ",paths);
	if (paths.length==0) paths=["meta"];
	db.get(paths,true,cb);
}
module.exports=get;