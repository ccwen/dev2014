var switchApp=function(path) {
	var fs=nodeRequire("fs");
	path="../"+path;
	document.location.href= path+"/index.html"; 
	process.chdir(path);
}
var downloader={};
var rootPath="";
if (typeof process!="undefined") {
	downloader=require("./downloader");
	rootPath=process.cwd();
	rootPath=nodeRequire("path").resolve(rootPath,"..").replace(/\\/g,"/")+'/';
}
var deleteApp=function(app) {
	console.error("not allow on PC, do it in File Explorer/ Finder");
}
var username=function() {
	return "";
}
var useremail=function() {
	return ""
}
var runtime_version=function() {
	return "1.2";
}
var ksanagap={
	platform:"node-webkit",
	startDownload:downloader.startDownload,
	downloadedByte:downloader.downloadedByte,
	downloadingFile:downloader.downloadingFile,
	cancelDownload:downloader.cancelDownload,
	doneDownload:downloader.doneDownload,
	switchApp:switchApp,
	rootPath:rootPath,
	deleteApp: deleteApp,
	username:username, //not support on PC
	useremail:username,
	runtime_version:runtime_version
}


module.exports=ksanagap;