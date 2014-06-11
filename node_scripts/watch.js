// watch.js // 
nodeRequire=require // cannot be removed
var fs=nodeRequire('fs');
var gui = global.window.nwDispatcher.requireNwGui();
var sep=require('path').sep;
var file=process.cwd()+sep+'build'+sep+'build.js';

var watchFiles=function() {
  fs.watchFile(file, function (f1, f2) {
    console.log('watching ',file)
    if (f1.mtime.toString()!=f2.mtime.toString()) reload();
  });
}
watchFiles();

var unwatchFiles=function() {
  fs.unwatchFile(file);
}

var reload=function(){
  var win = gui.Window.get();
	gui.App.clearCache();
	win.reload();
}

gui.Window.get().on('close', function(){
   unwatchFiles();
   gui.App.quit();
});