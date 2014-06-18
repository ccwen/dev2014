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


	var gitignore="*.kd\n*.kdx\n*.kdb\n"
	
	fs.writeFileSync(appname+'/ksana.json',JSON.stringify(ksanajson,'',' '),'utf8');
	fs.writeFileSync(appname+'/.gitignore',gitignore,'utf8');
	var kd_serialized="[\n"+kd_stringified.join("\n,")+"\n]";
	fs.writeFileSync(appname+'/1/1.kd',kd_serialized,'utf8');
};