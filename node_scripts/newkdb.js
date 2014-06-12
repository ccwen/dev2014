module.exports=function(appname,template,config){
	var configs=require("ksana-document").configs;
	var template=template||"simple";
	var config=config||"simple1";
	if (!configs[config]) {
		throw "config ["+config+"] not found";
		return;
	}
	console.log("creating db "+appname+" , template "+template, ", config "+config);
	var fs=require("fs");
	
	if (!fs.existsSync(appname+"/1")) fs.mkdirSync(appname+"/1");

	var ksanajson={
		  "name":appname
		  ,"author":"yourname"
		  ,"template":template
		  ,"desc":""
		  ,"ydbmeta":{
		  	"config":config
		  	,"outputencoding":"ucs2"
		  	,"estimatesize":16777216
  		}
	}
	var kd=[
		{"n":"page1","t":"content of page 1 of "+appname}
		,{"n":"page2","t":"content of page 2 of "+appname}
	]
	var kd_stringified=kd.map(function(obj) {return JSON.stringify(obj)});

	var gulpfile=	
	"// work around for GULP 1.2-2.4 (11/12/13) chdir to gulpfile directory before loading it \n"+
	"var fs=require('fs');\n"+
	"var gulpfn='gulpfile-app.js';\n"+
	"var path=require('path');\n"+
	"while (!fs.existsSync(path.resolve(gulpfn))) {\n"+
	"	if (path.resolve(gulpfn)==path.resolve('../'+gulpfn)) break;\n"+
	"	gulpfn='../'+gulpfn;\n"+
	"}\n"+
	"if (fs.existsSync(path.resolve(gulpfn))) { require(gulpfn) ;}"

	fs.writeFileSync(appname+'/ksana.json',JSON.stringify(ksanajson,'',' '),'utf8');
	fs.writeFileSync(appname+'/gulpfile.js',gulpfile,'utf8');
	var kd_serialized="[\n"+kd_stringified.join("\n,")+"\n]";
	fs.writeFileSync(appname+'/1/1.kd',kd_serialized,'utf8');
};