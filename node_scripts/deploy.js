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
var touchksanajs=function(filename,baseurl) {
	var content=fs.readFileSync(filename,"utf8");
	content=content.replace("jsonp_handler(","");
	content=content.replace("})","}");

	var json=JSON.parse(content);

	if (baseurl.indexOf("http://")!=0) baseurl="http://"+baseurl;
	if (baseurl[baseurl.length-1]!='/') baseurl+='/';
	json.baseurl=baseurl;
	
	fs.writeFileSync(filename,
		"jsonp_handler("+JSON.stringify(json,""," ")+")","utf8");	
}
var filenameOnly=function(f) {
	if (f.substr(0,7)=="http://") {
		var idx=f.lastIndexOf("/");
		return f.substr(idx+1);
	}
	return f;
}
var deploy=function(from,to,baseurl) {
	
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
		var fn=filenameOnly(f);
		var fromfile=(from+'/'+fn).replace(/\\/g,"/");
		var tofile=(to+'/'+fn).replace(/\\/g,"/");

		mkdirp.sync(require("path").dirname(to+'/'+fn));

		if (!fs.existsSync(fromfile)) {
			console.error("missing source file "+fn+" in ksana.js");
			process.exit();
		}

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
  		if (f=="ksana.js" && baseurl) {
  			setTimeout(function(){touchksanajs(tofile,baseurl)},100);	
  		}
  		setTimeout(function() {
  			fs.utimesSync(tofile, fromstat.atime, fromstat.mtime);
  		},100);
		}).pipe(fs.createWriteStream(tofile));
	});
	

}
module.exports=deploy;