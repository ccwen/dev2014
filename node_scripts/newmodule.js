/*
create a new non visual module for component.js
*/
module.exports=function(name,opts) {
	opts=opts||{};
	if (!name) {
		throw 'empty name, please specify --name=optional_owner/component_name'
		return;
	}

	fs=require('fs')
	var appname=process.cwd().replace(/\\/g,'/');
	
	appname=appname.substring(appname.lastIndexOf('/')+1)
	console.log(appname)

	var foldername=name.replace('/','-');

	var splitted=name.match(/(.*?)\/(.*$)/);
	if (!splitted) {
		foldername=appname+'-'+name;
		componentname=name;
		name=appname+'/'+name;
	} else {
		componentname=splitted[2];
	}
	
	console.log('creating new module',foldername);
	var newfolder='components/'+foldername;
	fs.mkdirSync(newfolder);

	var  module1=
	'var module1=[1,2,3,4,5]; \n\n'+
	'module.exports=module1;';

	var indexjsx=
'//var othercomponent=Require("other"); \n'+
'//new module filename must be added to scripts section of ./component.js and export here\n'+
'var '+componentname+' = {\n'+
' module1: require("./module1")\n'+
'}\n\n'+
'module.exports='+componentname+';';

var componentjson=
'{\n'+
'  "name": "'+componentname+'",\n'+
'  "repo": "'+name+'",\n'+
'  "description": "non visual module",\n'+
'  "version": "0.0.1",\n'+
'  "keywords": [],\n'+
'  "dependencies": {},\n'+
'  "development": {},\n'+
'  "license": "MIT",\n'+
'  "main": "index.js",\n'+
'  "scripts": ["index.js","module1.js"],\n'+
'  "styles": []\n'+
'}';


var indexcss='.'+componentname+' {}';


	fs.writeFileSync(newfolder+'/index.js',indexjsx,'utf8');
	fs.writeFileSync(newfolder+'/component.json',componentjson,'utf8');
	fs.writeFileSync(newfolder+'/module1.js',module1,'utf8');

/* add dependency to component.json*/
	var json=JSON.parse(fs.readFileSync('component.json','utf8'));
	json.dependencies[name]="*";
	fs.writeFileSync('component.json',JSON.stringify(json,'','  '),'utf8');
  
}