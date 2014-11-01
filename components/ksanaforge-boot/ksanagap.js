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
var ksanagap={
	platform:"node-webkit",
	startDownload:downloader.startDownload,
	downloadedByte:downloader.downloadedByte,
	downloadingFile:downloader.downloadingFile,
	cancelDownload:downloader.cancelDownload,
	doneDownload:downloader.doneDownload,
	switchApp:switchApp,
	rootPath:rootPath
}


module.exports=ksanagap;