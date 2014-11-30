var ksana={"platform":"remote"};
window.ksana=ksana;

if (typeof process !="undefined") {
	if (process.versions["node-webkit"]) {
  		if (typeof nodeRequire!="undefined") ksana.require=nodeRequire;
  		ksana.platform="node-webkit";
			window.ksanagap=require("./ksanagap"); //compatible layer with mobile
			window.kfs=require("./kfs");
  	}
} else if (typeof chrome!="undefined"){//} && chrome.fileSystem){
	window.ksanagap=require("./ksanagap"); //compatible layer with mobile
	window.ksanagap.platform="chrome";
	window.kfs=require("./kfs_html5");
	ksana.platform="chrome";
} else {
	if (typeof ksanagap!="undefined" ) {//mobile
		var ksanajs=fs.readFileSync("ksana.js","utf8").trim(); //android extra \n at the end
		ksana.js=JSON.parse(ksanajs.substring(14,ksanajs.length-1));
		ksana.platform=ksanagap.platform;
		if (typeof ksanagap.android !="undefined") {
			ksana.platform="android";
		}
	}
}

//if (typeof React=="undefined") window.React=require('../react');

//require("../cortex");
var Require=function(arg){return require("../"+arg)};
var timer=null;
var enterMainComponent=function() {
	var main=main||"main";
	var maindiv=maindiv||"main";
	ksana.mainComponent=React.render(Require(main)(),document.getElementById(maindiv));
}
var boot=function(appId,main,maindiv) {
	ksana.appId=appId;
	if (ksanagap.platform=="chrome") { //need to wait for jsonp ksana.js
		timer=setInterval(function(){
			if (ksana.ready){
				clearInterval(timer);
				enterMainComponent();
			}
		},300);
	} else {
		enterMainComponent();
	}
}
window.Require=Require;
module.exports=boot;