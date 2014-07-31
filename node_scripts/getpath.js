
var Kdb=require("ksana-document").kdb;

var fs=require("fs");
var get=function(path,recursive,cb) {
	var paths=path.split(".");
	var fn=paths.shift()+".kdb";

	if (!fs.existsSync(fn)) {
		throw "db "+fn+" not found";
		return;
	}
	new Kdb(fn,{},function(db){
		console.log("getting",paths,"from",fn);
		db.get(paths,recursive,cb);
	});
}
module.exports=get;