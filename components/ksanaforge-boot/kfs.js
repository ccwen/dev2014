//Simulate feature in ksanagap
/* 
  runs on node-webkit only
*/

var readDir=function(path) { //simulate Ksanagap function
	var fs=nodeRequire("fs");
	path=path||"..";
	var dirs=[];
	if (path[0]==".") {
		if (path==".") dirs=fs.readdirSync(".");
		else {
			dirs=fs.readdirSync("..");
		}
	} else {
		dirs=fs.readdirSync(path);
	}

	return dirs.join("\uffff");
}
var listApps=function() {
	var fs=nodeRequire("fs");
	var jsonfile=function(d) {return "../"+d+"/ksana.json"};
	var dirs=fs.readdirSync("..").filter(function(d){
				return fs.statSync("../"+d).isDirectory() && d[0]!="."
				   && fs.existsSync(jsonfile(d));
	});
	
	var out=dirs.map(function(d){
		var obj= JSON.parse(fs.readFileSync(jsonfile(d),"utf8"));
		obj.dbid=d;
		obj.path=d;
		return obj;
	})
	return JSON.stringify(out);
}

var kfs={readDir:readDir,listApps:listApps};

module.exports=kfs;