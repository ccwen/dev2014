var switchApp=function(path) {
  process.chdir("../"+path);
  document.location.href= "../"+path+"/index.html"; 
}
var ksanagap={
	platform:"node-webkit",
	downloader:require("./downloader"),
	switchApp:switchApp
}


module.exports=ksanagap;