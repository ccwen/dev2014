// settings
var nw=require('./node_scripts/gulp-nw');
var extras=require('./node_scripts/gulp-extras');
//var repos=require('./node_scripts/repos');

//third party
var gulp = require('gulp'); 
var https = require('https');
var http = require('http');
var fs = require('fs');
var fstream=require('fstream');
var unzip=require('unzip');
var clean = require('gulp-clean');
var spawn = require('child_process').spawn;
var exec= require('child_process').exec;
var zlib=require('zlib');
var tar=require('tar');
var outback = function (s) {
    while (s.length < 70) s += ' ';
    var l = s.length; 
    for (var i = 0; i < l; i++) s += String.fromCharCode(8);
    process.stdout.write(s);
}

gulp.task('install-extras',function() {
	extras.map(function(E){
		var writeStream = fstream.Writer(E.path);
		var datalength=0;
		var request = https.get(E.url, function(response) {
			response.on('data',function(chunk){
				datalength+=chunk.length;
			})
			.pipe(writeStream);
		});		
	});
});

gulp.task('install-nw', ['install-socket.io-cli'],function() {
	var parent=nw.path.split('/');
	parent.pop();
	var parentfolder=parent.join('/');
	var p=http;
	if (nw.url.indexOf("https")==0) p=https;
	if (parentfolder && !fs.existsSync(parentfolder)) fs.mkdirSync(parentfolder);
	if (!fs.existsSync(nw.path)) fs.mkdirSync(nw.path);
	var writeStream = fstream.Writer(nw.path);
	var datalength=0;
	var request = p.get(nw.url, function(response) {
		response.on('data',function(chunk){
			datalength+=chunk.length;
			outback('downloading '+datalength);
		});
		response.on("end",function() {
			setTimeout(function(){
				console.log("renaming")
				if (nw.rename) {
					require('fs').renameSync(nw.rename[0],nw.rename[1]);
				}
			},1000);
		});
		if (nw.path.indexOf("linux")>-1) {
			response.pipe(zlib.createGunzip()	)
			.pipe(tar.Parse())
			.pipe(writeStream);	
		} else {
			response.pipe(unzip.Parse())
			.pipe(writeStream);
		}
	});
});
/*
gulp.task('clonerepos',function() {
      var argv = require('minimist')(process.argv.slice(2));
      var branch = argv['b'] || "master" ;
  	for (var i in repos) {
		console.log('clone ',repos[i].url, "branch",branch)
		gulp.src(repos[i].target,{read:false}).pipe(clean());
		spawn('git', ["clone",repos[i].url,repos[i].target,"-b",branch]);
	}
});
*/
gulp.task('install-socket.io-cli',function() {
	return gulp.src('node_modules/socket.io/node_modules/socket.io-client/socket.io.js')
  .pipe(gulp.dest('components/socketio-socketio/'));
  
})
gulp.task('component-install',function(){
	exec('component install');
})

//default html5 application
gulp.task('install5',[//'clonerepos',
  'component-install',
  'install-socket.io-cli',
  'install-extras']);

gulp.task('install', [//'clonerepos',
	'install-nw',
	'install-socket.io-cli',
	'component-install',
	'install-extras']);

gulp.task('sampleapp', function(){
	var sample=spawn('git', ["clone","https://github.com/dhammagear/sampleapp"]);
	sample.on("exit",function(){
		console.log("sample downloaded, type to run the sample");
		console.log(">cd sampleapp");
    console.log(">gulp");
	});
});

gulp.task('setup',['install5'],function(){
    //console.log("to create demo app, type");
    //console.log(">gulp sampleapp");
    console.log("setup success");
});

var createapp=function(name,newapp) {
  chdir_initcwd();  
  
  console.log(name,process.cwd())
  if (fs.existsSync(name+'/gulpfile.js')) {
  	throw "not an empty folder";
  	return;
  }
  newapp(name);
  process.chdir(name);
  newcomponent(name+'/main');
  newcomponent(name+'/comp1'); //need at least 2 component for gulp to work properly
  process.chdir('..');

  if (newapp.touchComponent) newapp.touchComponent(name);
  console.log('success, cd to '+name+' and type')
  console.log('gulp')
}

var newapp=require('./node_scripts/newapp');
var newapp5=require('./node_scripts/newapp5');
var newkapp=require('./node_scripts/newkapp');
var newcomponent=require('./node_scripts/newcomponent');

gulp.task('newapp-nw',function(){ //rename from newapp
  var argv = require('minimist')(process.argv.slice(2));
  var name = argv['name'];
  createapp(name);
});
gulp.task('newapp',function(){  // make newapp5 default task
  var argv = require('minimist')(process.argv.slice(2));
  var name = argv['name'] || argv['n'];
  createapp(name,newapp5);
});

gulp.task('newkapp',function(){  // make newapp5 default task
  var argv = require('minimist')(process.argv.slice(2));
  var name = argv['name']  || argv['n'];
  createapp(name,newkapp);
});

gulp.task('init',function() {  //user create in an empty repository
  var name=process.cwd();
  name=name.substring(1+name.lastIndexOf(require("path").sep));
  process.chdir("..");
  createapp(name);
});

var newkdb=require("./node_scripts/newkdb");
gulp.task("initdb",function() {
  var argv = require('minimist')(process.argv.slice(2));
  var name = argv['name'];
  var template = argv['template'];
  var config = argv['config'];
  if (!name) {
  	throw "mssing --name=dbid";
  	return;  	
  }
  if (fs.existsSync(name)) {
  	throw "folder already exists";
  	return;
  }
  newkdb(name,template,config);
});

gulp.task('qunit',function(){
  var argv = require('minimist')(process.argv.slice(2));
  var name = argv['js']||argv['j'],nodemode="";
  if (!name) {
    name = argv['nodejs'];   //forcing nodejs context, QUnit
    nodemode="!";
  }

  if (!name) {
    console.log("please specify debuggee");
    console.log("gulp qunit -j yourcode.js");
    return ;
  }
  var filename=name;
  var shellscript="qunit.cmd";
  if (process.platform=="darwin") shellscript="./qunit.sh";
  chdir_initcwd();  
  var cwd=process.cwd();
  
  if (name[0]!='/' && name[1]!=':') filename=process.cwd()+require('path').sep+name;

  if (fs.existsSync(filename)) {
    while (!fs.existsSync(shellscript)) process.chdir("..")
    exec(shellscript+" "+filename+nodemode, {}, function(error, stdout, stderr) {
  // work with result
      if (error) throw error;
    });
    
  } else {
    console.log('cannot find debuggee, syntax: ');
    console.log('gulp qunit --js=debuggee.js');
    console.log('gulp qunit --nodejs=debuggee.js');
  }
});
var chdir_initcwd=function() {
  if (!process.env.INIT_CWD) {
    throw "please update to gulp >3.8.1"
  }
  process.chdir(process.env.INIT_CWD);
}

gulp.task('mkdb',function() {
  chdir_initcwd();
  var argv = require('minimist')(process.argv.slice(2));
  var name = argv['name'];
  if (name) {
    process.chdir(name);
  }
  if (!fs.existsSync("ksana.json")) {
    throw " must be a ksana_databases"
  }
  if (fs.existsSync("mkdb.js")) { //user specify a setting file
    require("./node_scripts/buildfromxml")(".");
  } else {
    require("./node_scripts/buildindex")(".");
  }
});

gulp.task("get",function(){
  var argv = require('minimist')(process.argv.slice(2));
  var path = argv["p"] || argv["path"];
  var recursive = argv["r"] || argv["recursive"];
  var address = argv["a"] || argv["address"];

  if (!path) {
    console.log("gulp get --path=db.x.y.z  or -p db.x.y.z");
    console.log("optional flag --recursive or -r");
    console.log("optional flag --address or -a");
    throw "missing db name and path";
  }
  var getpath=require("./node_scripts/getpath");
  chdir_initcwd();

  getpath(path,{recursive:!!recursive,address:address},function(data){
    console.log("result=",JSON.stringify(data,""," "));
  });
});

gulp.task("deploy_nw",function(){
  var argv = require('minimist')(process.argv.slice(2));
  var outputpath = argv["o"] || argv["output"];
  if (!outputpath) {
    console.log("gulp deploy_nw --output=/rootfolder  or -o /rootfolder");
    throw "missing output path";
  }
  chdir_initcwd();
  var deploy=require("./node_scripts/deploy_nw");
  deploy(process.cwd(), outputpath);

});
