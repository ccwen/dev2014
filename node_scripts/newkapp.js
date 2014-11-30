//create new html5 app
/*
  no socket.io
  add offline.appcache
  add 
*/
var fs=require('fs');

var getgitrawbaseurl=function(gitrepo) {
	//"https://github.com/ksanaforge/test2.git"
	return gitrepo.replace("https:","http:")
	.replace("github.com","rawgit.com")
	.replace(".git","/master/");

	/// "baseurl":"http://rawgit.com/ksanaforge/test2/master/",	
}

var getgiturl=function(appname) {
	var url=fs.readFileSync(appname+'/.git/config','utf8');//.match(/url = (.*?)\n/);
	url=url.substr(url.indexOf('url ='),100);
	url=url.replace(/\r\n/g,'\n').substring(6,url.indexOf('\n'));
	return url;
}
var newkapp=function(appname){
	console.log(appname,process.cwd())

	var die=function() {
		console.log.apply(this,arguments)
		process.exit(1);
	}


	if (!appname) die('Please specifiy --name=newappname');
	if (!fs.existsSync(appname)) die('folder not exists');
	if (!fs.existsSync(appname+'/.git')) die('not a git repository');

	var gitrepo=getgiturl(appname).trim()||"";
	var componentjson=
'{\n'+
'  "name": "'+appname+'",\n'+
'  "repo": "'+gitrepo+'",\n'+
'  "description": "hello world",\n'+
'  "version": "0.0.1",\n'+
'  "keywords": [],\n'+
'  "dependencies": {\n'+
'    "ksanaforge/boot": "*"\n'+
'    ,"brighthas/bootstrap": "*"\n'+
'    ,"ksana/document": "*"\n'+
'    ,"ksanaforge/stacktoc":"*"\n'+
'    ,"ksanaforge/fileinstaller":"*"\n'+
'    ,"ksanaforge/checkbrowser":"*"\n'+
'    ,"ksanaforge/fileinstaller":"*"\n'+
'    ,"ksanaforge/swipe":"*"\n'+
'    ,"ksanaforge/defaultmain":"*"\n'+
'    ,"ksanaforge/defaultresultlist":"*"\n'+
'    ,"ksanaforge/defaultshowtext":"*"\n'+
'    ,"ksanaforge/htmlfs":"*"\n'+
'  },\n'+
'  "development": {},\n'+
'  "paths": ["components","../components","../../components","../node_modules/","../../node_modules/"],\n'+
'  "license": "MIT",\n'+
'  "main": "index.js",\n'+
'  "scripts": ["index.js"],\n'+
'  "styles": ["index.css"]\n'+
'}';
	var gitignore="*.kdb\n*.kdbk\n*.pdf\n*.xml";
	var indexjs='var boot=require("boot");\nboot("'+appname+'","main","main");';
	var indexcss='#main {}';

	
	var ksanajs='jsonp_handler({\n'+
  	'"version": "1",\n'+
  	'"build": 1,\n'+
  	'"title":"'+appname+'",\n'+
  	'"date":"'+new Date()+'",\n'+
  	'"minruntime": 4,\n'+
  	'"baseurl":"'+getgitrawbaseurl(gitrepo)+'",\n'+
  	'"description":"",\n'+
  	'"files":["index.html","build.js","build.css","jquery.js","react-with-addons.js","ksana.js","'+appname+'.kdb"]\n'+
  	'})';

	var indexhtml='<!DOCTYPE html>\n<html>\n'+
						'<head>\n'+
						'<meta charset="utf-8" />\n'+
						'<meta name="mobile-web-app-capable" content="yes" />\n'+
						'<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=2.0, user-scalable=1"/>\n'+
						'<script src="jquery.js"></script>\n'+
						'<script src="react-with-addons.js"></script>\n'+
						'<link type="text/css" rel="stylesheet" href="build.css">\n'+
						'</head>\n'+
						'<div id="main"></div>\n'+
						'<script src="build.js"></script>\n'+
						'</html>';
	var packagejson='{\n'+
						'  "name": "'+appname+'",\n'+
						'  "description": "New Ksana application",\n'+
						'  "version": "0.0.1",\n'+
						'  "main": "index.html",\n'+
						'  "inject-js-start":"nodemain.js",\n'+
						'  "single-instance":true,\n'+
						'  "window": {\n'+
						'    "toolbar": true,\n'+
						'    "width": 1060,\n'+
						'    "height": 700\n'+
						'  },\n'+
						' "repositories": [\n'+
						'  {\n'+
						'            "type": "git", \n'+
						'            "url": "'+gitrepo+'"\n'+
						'       }  \n'+
						'    ]\n'+
						'}';
	

	//default gulpfile to prevent from using parent gulpfile
	var gulpfile="require('../gulpfile-app.js');";

	var sourcelst="sample.xml";
	var samplexml=fs.readFileSync("node_scripts/sample.xml","utf8");
	var regex_appname=new RegExp("%%","g");
	var mkdbjs=fs.readFileSync("node_scripts/mkdb.js","utf8");

	//copy jquery and react
	var copyFile=function(path) {
		var fn=path.substr(path.lastIndexOf("/"));
		fs.writeFileSync(appname+fn, fs.readFileSync(path));
	}
	var jqueryfn="components/component-jquery/jquery.js";
	if (!fs.existsSync(jqueryfn))jqueryfn="../"+jqueryfn;
	var reactfn="components/facebook-react/react-with-addons.js";
	if (!fs.existsSync(reactfn))reactfn="../"+reactfn;	
	copyFile(jqueryfn);
	copyFile(reactfn);
	fs.writeFileSync(appname+'/.gitignore',gitignore,'utf8');
	fs.writeFileSync(appname+'/ksana.js',ksanajs,'utf8');
	fs.writeFileSync(appname+'/gulpfile.js',gulpfile,'utf8');
	fs.writeFileSync(appname+'/component.json',componentjson,'utf8');
	fs.writeFileSync(appname+'/index.js',indexjs,'utf8');
	fs.writeFileSync(appname+'/package.json',packagejson,'utf8');
	fs.writeFileSync(appname+'/index.css',indexcss,'utf8');
	fs.writeFileSync(appname+'/index.html',indexhtml,'utf8');
	fs.writeFileSync(appname+'/mkdb.js',mkdbjs.replace(regex_appname,appname) ,'utf8');
	fs.writeFileSync(appname+'/'+appname+'.lst',sourcelst,'utf8');
	fs.writeFileSync(appname+'/sample.xml',samplexml,'utf8');
	var nodemain=fs.readFileSync("nodemain.js","utf8");
	fs.writeFileSync(appname+'/nodemain.js',nodemain,'utf8');
	fs.mkdirSync(appname+'/components');
}
newkapp.touchComponent=function(name) {
	var gitrepo=getgiturl(name).trim()||"";
	var jsx='var require_kdb=[{filename:"%%.kdb", url:"'+getgitrawbaseurl()+'%%.kdb" , desc:"%%"}];\n'+
            'var Main = React.createClass({\n'+
			'  mixins:[Require("defaultmain")],\n'+
			'  dbid:"%%",\n'+
			'  defaultTofind:"",\n'+
			'  require_kdb:require_kdb,\n'+
			'});\n'+
			'module.exports=Main;'

	var regex_appname=new RegExp("%%","g");	
	jsx=jsx.replace(regex_appname,name);
	var fs=require("fs")
	fs.writeFileSync(name+"/components/"+name+"-main/index.jsx",jsx,"utf8");
}
module.exports=newkapp;