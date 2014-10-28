var ksana={"platform":"remote"};

if (typeof process !="undefined") {
	if (process.versions["node-webkit"]) {
  		ksana.platform="node-webkit";
			window.ksanagap=require("./ksanagap"); //compatible layer with mobile
			window.kfs=require("./kfs");
  		if (typeof nodeRequire!="undefined") ksana.require=nodeRequire;
  	}
} else if (typeof chrome!="undefined"){//} && chrome.fileSystem){
	window.ksanagap=require("./ksanagap"); //compatible layer with mobile
	window.ksanagap.platform="chrome";
	window.kfs=require("./kfs_html5");
	ksana.platform="chrome";
}

//if (typeof React=="undefined") window.React=require('../react');

//require("../cortex");
var Require=function(arg){return require("../"+arg)};
var boot=function(appId,main,maindiv) {
	main=main||"main";
	maindiv=maindiv||"main";
	ksana.appId=appId;
	ksana.mainComponent=React.renderComponent(Require(main)(),document.getElementById(maindiv));
}
window.ksana=ksana;
window.Require=Require;
module.exports=boot;