var http=nodeRequire("http");
var fs = nodeRequire("fs");
var path = nodeRequire("path");
var mkdirp=require("./mkdirp");
var downloadid=0;
var userCancel=false;
var files=[];
var totalDownloadByte=0;
var targetPath="";
var tempPath="";
var nfile=0;
var baseurl="";

var startDownload=function(dbid,_baseurl,_files) { //return download id
	files=_files.split("\uffff");
	if (downloadid) return; //only one session
	userCancel=false;
	totalDownloadByte=0;
	nextFile();
	downloadid=1;
	baseurl=_baseurl;
	targetPath=ksanagap.rootPath+dbid+'/';
	tempPath=ksanagap.rootPath+".tmp/";
	console.log("targetpath",targetPath);

	return downloadid;
}

var nextFile=function() {
	setTimeout(function(){
		if (nfile==files.length) {
			endDownload(downloadid);
		} else {
			downloadFile(nfile++);	
		}
	},100);
}

var downloadFile=function(nfile) {
	var url=baseurl+files[nfile];
	var tmpfilename=tempPath+files[nfile];
	var targetfilename=targetPath+files[nfile];
	mkdirp.sync(path.dirname(tmpfilename));
	var writeStream = fs.createWriteStream(tmpfilename);
	var datalength=0;
	console.log("downloading",url);
	var request = http.get(url, function(response) {
		response.on('data',function(chunk){
			writeStream.write(chunk);
			datalength+=chunk.length;
			totalDownloadByte+=datalength;
			if (userCancel) {
				writeStream.end();
				endDownload(downloadid);
			}
		});
		response.on("end",function() {
			setTimeout(function(){
				console.log("rename",tmpfilename,targetfilename);
				mkdirp.sync(path.dirname(targetfilename));
				fs.renameSync(tmpfilename,targetfilename);
				nextFile();
			},100);
			writeStream.end();
		});
	});
}

var cancelDownload=function(_downloadid) {
	if (downloadid==_downloadid) userCancel=true;
}
var endDownload=function(_downloadid) {

}

var downloadedByte=function(_downloadid) {
	if (downloadid==_downloadid) return totalDownloadByte;
	else return 0;
}
var doneDownload=function(_downloadid) {
	if (downloadid==_downloadid) return (nfile>=files.length) ;
	else return true;
}
var downloadingFile=function(_downloadid) {
	if (downloadid==_downloadid) return nfile-1;
	else return 0;
}

var downloader={startDownload:startDownload, downloadedByte:downloadedByte,
	downloadingFile:downloadingFile, cancelDownload:cancelDownload,doneDownload:doneDownload};
module.exports=downloader;