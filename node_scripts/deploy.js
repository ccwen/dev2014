/*
  deploy runtime files to a given folder (USB)
*/
var mkdirp=require("./mkdirp");
var fs=require("fs");
var touchpackagejson=function(filename) {
	var json=JSON.parse(fs.readFileSync(filename,"utf8"));	
	json.window.toolbar=false;
	fs.writeFileSync(filename,JSON.stringify(json,""," "),"utf8");
}
var deploy=function(from,to) {
	
	var ksana=(from+'/ksana.js').replace(/\\/g,"/");
	if (!fs.existsSync(ksana)) {
		throw "missing "+ksana;
		return;
	}
	var content=fs.readFileSync(ksana,"utf8");
  content=content.replace("})","}");
  content=content.replace("jsonp_handler(","");
	var json=JSON.parse(content);

	mkdirp.sync(to);
	if (json.files.indexOf("ksana.js")==-1) {
		json.files.push("ksana.js");
	}
	json.files.map(function(f){
		var fromfile=(from+'/'+f).replace(/\\/g,"/");
		var tofile=(to+'/'+f).replace(/\\/g,"/");
		var fromstat=fs.statSync(fromfile);
		var tostat={mtime:0};
		if (fs.existsSync(tofile)) tostat=fs.statSync(tofile);
		//no need to copy
		if (Date.parse(fromstat.mtime)==Date.parse(tostat.mtime)) return;
		fs.createReadStream(fromfile)
		.on('end', function() {
  		console.log(f,"copied");
  		if (f=="package.json") {
  			setTimeout(function(){touchpackagejson(tofile)},100);
  		}
  		setTimeout(function() {
  			fs.utimesSync(tofile, fromstat.atime, fromstat.mtime);
  		},100);
		}).pipe(fs.createWriteStream(tofile));
	});
	
}
module.exports=deploy;