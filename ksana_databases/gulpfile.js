// work around for GULP 1.2-2.4 (11/12/13) chdir to gulpfile directory before loading it 
var fs=require('fs');
var gulpfn='gulpfile-app.js';
var path=require('path');
while (!fs.existsSync(path.resolve(gulpfn))) {
	if (path.resolve(gulpfn)==path.resolve("../"+gulpfn)) break;
	gulpfn="../"+gulpfn;
}
if (fs.existsSync(path.resolve(gulpfn))) { require(gulpfn) ;}