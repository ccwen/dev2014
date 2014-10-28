// dev2014\gulpfile-app.js //
/*
	shared gulpfile for applications
*/
var newcomponent=require('./node_scripts/newcomponent');
var newmodule=require('./node_scripts/newmodule');

var nw=require('./node_scripts/gulp-nw');
var paths = {
  buildscripts: ['components/**/*.jsx'],
  buildscripts_common: ['../components/**/*.jsx'],
  buildscripts_common2: ['../../components/**/*.jsx']
};

paths.buildscripts_all=[
"components/**/*.jsx",
"components/**/*.js",
"!components/**/index.js",
"../components/**/*.jsx",
"../components/**/*.js",
"../../components/**/*.jsx",
"../../components/**/*.js",
"!../components/**/index.js",
"!../../components/**/index.js"
];

var tempjs=[];
var fs=require('fs')
var path=require('path')
var gulp=require('gulp');
var spawn=require('child_process').spawn;
var exec=require('child_process').exec;
var react = require('gulp-react');
var uglify = require('gulp-uglify');
var concat = require('gulp-concat');
var tap=require('gulp-tap');
var filelog=require('gulp-filelog');
var component=require('gulp-component');
var rename=require('gulp-rename');

gulp.task('newcomponent',function(){
  var argv = require('minimist')(process.argv.slice(2));
  var name = argv['name'];
  newcomponent(name);
});
gulp.task('newmodule',function(){
  var argv = require('minimist')(process.argv.slice(2));
  var name = argv['name'];
  newmodule(name);
});

var jsx2js_check=function(path) {
    return gulp.src(path).pipe(tap(function(file,f){
        var r=gulp.src(file.path).pipe(react()).on('error', 
         function(error) {
          console.log("Line:"+error.lineNumber+",Col:"+error.column+" of "+ file.path);
          console.log(error.description);
          throw ("jsx to jx error");
        }
    )}));
}
gulp.task('jsx2js_test',function(){
  return jsx2js_check(paths.buildscripts);
});

gulp.task('jsx2js',['jsx2js_test'],function() {
    gulp.src(paths.buildscripts)
    .pipe(tap(function(file, t) {
        if (path.extname(file.path) === '.jsx') {
            tempjs.push(file.path.substring(0,file.path.length-1));
        }
    }))

    return gulp.src(paths.buildscripts).pipe(react()).pipe(gulp.dest("components"))  
});


gulp.task('jsx2js_common_test',function(){
  return jsx2js_check(paths.buildscripts_common);
});

gulp.task('jsx2js_common',['jsx2js_common_test'],function() {
    gulp.src(paths.buildscripts_common)
    .pipe(tap(function(file, t) {
        if (path.extname(file.path) === '.jsx') {
            tempjs.push(file.path.substring(0,file.path.length-1));
        }
    }))
//cannot use tap to invoke react, spent 2 hours to figure out
    return gulp.src(paths.buildscripts_common).
    pipe(react()).pipe(gulp.dest("../components"));
});


gulp.task('jsx2js_common2_test',function(){
  return jsx2js_check(paths.buildscripts_common2);
});

gulp.task('jsx2js_common2',['jsx2js_common2_test'],function() {
    gulp.src(paths.buildscripts_common2)
    .pipe(tap(function(file, t) {
        if (path.extname(file.path) === '.jsx') {
            tempjs.push(file.path.substring(0,file.path.length-1));
        }
    }))
//cannot use tap to invoke react, spent 2 hours to figure out
    return gulp.src(paths.buildscripts_common2).
    pipe(react()).pipe(gulp.dest("../../components"));
});
gulp.task('componentbuild',['jsx2js','jsx2js_common','jsx2js_common2'],function() {
  return gulp.src('./component.json')
  .pipe(component({standalone: true}))
  .pipe(gulp.dest('.'));
});

gulp.task('touchksanajson',function(){
  var fn="ksana.json";
  if (!fs.existsSync(fn))return;

  var ksana=JSON.parse(fs.readFileSync(fn,"utf8"));
  var filedates=[],filesizes=[];
  if (!ksana || !ksana.files) return;
  ksana.files.forEach(function(f){
    if (!fs.existsSync(f)) {
	     console.log("missing ",f); 
	     return;
    };
    var stat=fs.statSync(f);
    filedates.push( stat.mtime);
    filesizes.push( stat.size);
  });

  ksana.filesizes=filesizes;
  ksana.filedates=filedates;
  ksana.date=new Date();
  ksana.build=parseInt(ksana.build||"1")+1;

  fs.writeFileSync(fn,JSON.stringify(ksana,""," "),'utf8');

})
gulp.task('touchappcache',function(){
  var fn="offline.appcache";
  if (fs.existsSync(fn)){
    var content=fs.readFileSync(fn,"utf8").replace(/\r\n/g,"\n").split("\n");
    content[1]="# Updated on "+new Date();
    fs.writeFileSync(fn,content.join("\n"),"utf8");
  }
})
gulp.task('rebuild',['componentbuild','touchksanajson'],function(){
  /* remove use strict in build.js 
     workaround for socketio not strict safe */
  
  //socket io is removed from build.js ..2014.7.13
//  var buildjs=fs.readFileSync('./build/build.js','utf8')
//  var buildjs=buildjs.replace("'use strict';","// 'use strict'; // socketio is not strict safe");
//  fs.writeFileSync('./build/build.js',buildjs,'utf8')

  tempjs.map(function(f){fs.unlink(f)});
  tempjs.length=0;
  if (gulp.afterbuild) {
    gulp.afterbuild();
  }
	return true;
})
gulp.task('watch', function () {
  gulp.watch(paths.buildscripts_all, ['rebuild']);
});

var appprocessexit=function() {
  process.exit(1);
}

gulp.task('run',['rebuild'],function(){
  var instance=spawn(nw.bin,['--remote-debugging-port=9222','.'])
  instance.on('exit',function(){
    appprocessexit();
  })
});

//run server and use current directory as wwwroot
gulp.task('server',['rebuild','watch'],function(){
  var instance=spawn("node",['../node_scripts/server','--cwd','..'])
  chdir_initcwd();
  instance.on('exit',function(){
    appprocessexit();
  });
  var appfolder=process.cwd().match(/[\/\\]([^\/\\]*?)$/)[1];
  console.log("your application can be accessed from ");
  console.log(("http://127.0.0.1:2556/"+appfolder));
});

var runserver=function(serverfn){
  var appfolder=process.cwd().match(/[\/\\]([^\/\\]*?)$/)[1];
  chdir_initcwd();
  process.chdir("..");//switch to upper directory

  //if (!fs.existsSync(serverfn)) serverfn="../"+serverfn;
  var instance=spawn("node",[serverfn]);
  instance.on('exit',function(){
    appprocessexit();
  });
  chdir_initcwd();
  console.log("your application can be accessed from ");
  console.log(("http://127.0.0.1:2556/"+appfolder));
}

gulp.task('pouchdb',['rebuild','watch'],function(){
  runserver("node_scripts/express.js");
});

gulp.task('default',['rebuild','watch'],function(){
  runserver("node_scripts/server.js");
});

gulp.task('min',['rebuild'],function(){
  return gulp.src('build.js').pipe(uglify()).
  pipe(rename('build.min.js')).pipe(gulp.dest('.'));
})
gulp.task('mkzip',['min'],function(){
  var mkzip=require('./node_scripts/mkzip');
  chdir_initcwd();
  var appfolder=process.cwd();
  var argv = require('minimist')(process.argv.slice(2));
  var platform=argv['platform'] || process.platform;;
  mkzip(appfolder,platform,argv['product']);
});
var chdir_initcwd=function() {
  if (!process.env.INIT_CWD) {
    throw "please update to gulp >3.8.1"
  }
  process.chdir(process.env.INIT_CWD);
}
gulp.task('qunit',function(){
  var argv = require('minimist')(process.argv.slice(2));
  var name = argv['js'];
  var nodemode="";
  if (!name) {
    name = argv['nodejs'];   //forcing nodejs context, QUnit
    nodemode="!";
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
  }
  
});

gulp.task('mkdb',function() {
  var argv = require('minimist')(process.argv.slice(2));
  var name = argv['name'];

  var buildfromxml=require("./node_scripts/buildfromxml");
  var buildindex=require("./node_scripts/buildindex");

  chdir_initcwd();
  if (name) {
    process.chdir(name);
  }
  
  if (!fs.existsSync("ksana.json")) {
    throw " must be a ksana_databases"
  }
  
  if (fs.existsSync("mkdb.js")) { //user specify a setting file
    var mkdb=require("./mkdb.js");
    mkdb.gulp=true;
    buildfromxml(".");
  } else {
    buildindex(".");
  }
});

var newkdb=require("./node_scripts/newkdb");
gulp.task("initdb",function() {
  chdir_initcwd();
  var argv = require('minimist')(process.argv.slice(2));
  var name = argv["name"];
  var template = argv["template"];
  var config = argv["config"];
  if (!name) {
    throw "mssing --name=dbid";
    return;   
  }

  if (fs.existsSync(name)) {
    if (fs.existsSync(name+'/ksana.json')) {
      throw "folder and ksana.json exist";
      return;
    }
  } else {
    fs.mkdirSync(name);
  }
  newkdb(name,template,config);
  console.log("==build database==");
  console.log("cd "+name);
  console.log("gulp mkdb");
});

var Stream=require("stream");

gulp.task("import",function(){
  var argv = require('minimist')(process.argv.slice(2));
  var xml = argv["xml"];
  var sep= argv["sep"] || "_.id" ;
  if (!xml) {
    console.log("gulp import --xml=filename --sep=tag.attr");
    console.log("default sep = _.id ");
    throw "missing filename"
  }
  var importer=require("./node_scripts/importer");
  chdir_initcwd();
  var Path=require("path");
  function gulpImport(obj) {
    var stream = new Stream.Transform({objectMode: true});
    stream._transform = function(file, unused, callback) {
      var relativepath=Path.relative(process.cwd(),Path.dirname(file.path));
      var fn=relativepath+Path.sep+file.relative;
      if (Path.extname(fn)=="") fn+=".xml";
      if (Path.extname(fn)==".xml") {
        console.log("importing",fn);
        var report=importer(fn,sep);
        console.log(JSON.stringify(report));        
      }
      callback(null, file);
    }
    return stream;
   }
   gulp.src(xml).pipe(gulpImport());

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

  getpath(path,{recursive:!!recursive, address:address},function(data){
    console.log("result=",JSON.stringify(data,""," "));
  });
});
gulp.task('nw',['run','watch']);

gulp.task('deploy',function(){
  var argv = require('minimist')(process.argv.slice(2));
  var outputpath = argv["o"] || argv["output"];
  if (!outputpath) {
    console.log("gulp deploy --output=/rootfolder  or -o /rootfolder");
    throw "missing output path";
  }
  chdir_initcwd();

  var deploy=require("./node_scripts/deploy");
  deploy(process.cwd(), outputpath);
});

module.exports=gulp;
