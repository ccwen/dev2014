var fs=require('fs');
var http=require('http');
var url = require('url');
var path = require('path');
var restart=require('./restart');//restart helper
var rpc_node=require('./rpc_node');
//var googlelogin=require('./googlelogin');
var googlelogin={};
/*
offline application
  <html manifest="offline.appcache" 
	chrome://appcache-internals/ 
	http://appcachefacts.info/
*/  
	
var spawn = require('child_process').spawn;
var argv = require("minimist")(process.argv.slice(2));

var port= parseInt(argv.port|| argv.p || "2556"); 
var appendhtml=false;

if (argv.cwd) {
	process.chdir(argv.cwd);
}

if (argv.help) {
	console.log("--port ");
	console.log("--cwd ");
	return;
}
console.log("home dir",process.cwd())
function dirExistsSync (d) {
try { return fs.statSync(d).isDirectory() }
  catch (er) { return false }
 }
 var forcerestart=function(res) {
	fs.writeFileSync(__dirname+'\\restart.js',"var a=null;");
	res.statusCode = 302;
	console.log('redirect to '+startfolder);
	res.setHeader("Location", "/"+startfolder+"/");
	res.end();
	return;
 }
 var getMIMEType=function(ext) {
	var mimeTypes = {
	    "html": "text/html",
	    "htm": "text/html",
	    "jpeg": "image/jpeg",
	    "jpg": "image/jpeg",
	    "png": "image/png",
	    "svg": "image/svg+xml",
	    "js": "application/javascript",
	    "appcache": "text/cache-manifest",
	    "css": "text/css"
	};
 	return mimeTypes[ext] || 'application/octet-stream';
 }
var servestatic=function(filename,stat,req,res) {
	var ext=filename.substring(filename.lastIndexOf("."));
	var etag = stat.size + '-' + Date.parse(stat.mtime);
	var nocache=(req.connection.remoteAddress=='127.0.0.1') || 
	(ext=='.js' || ext=='.tmpl' || ext==".manifest" || ext==".kdb");
	var statuscode=200;
	if(!nocache && req.headers['if-none-match'] === etag) {
		res.statusCode = 304;
		res.end();
	} else {
	 	var range=null, opts={};
	 	if (req.headers.range) range=req.headers.range.match(/bytes=(\d+)-(\d+)/);
		
		var mimeType = getMIMEType(path.extname(filename).split(".")[1]);
		var header={"Content-Type":mimeType, "Content-Length":stat.size};
	 	if (range) {
	 		opts={start:parseInt(range[1]),end:parseInt(range[2])};
	 		var totalbytes=opts.end-opts.start+1;
	 		header["Content-Length"]=opts.end-opts.start+1;
	 		//header["Content-Range"]='bytes ' + opts.start + '-' + opts.end + '/' + totalbytes;
	 		//header["Accept-Ranges"]='bytes';
	 		//statuscode=206;
	 	}

		if ( nocache) {
			console.log('serving no cache file '+filename);
		} else {
			console.log('serving file '+filename);
			header['Last-Modified']=stat.mtime;
			header['ETag']= etag;
		}
		res.writeHead(statuscode, header);
		if (req.method=="HEAD") {
			res.end();
		} else {
			var fileStream = fs.createReadStream(filename,opts);
			fileStream.pipe(res);			
		}
	}
}

var startserver=function() {
	
    var httpd=http.createServer(function(req, res) {
		if (req.method=="POST") {
			res.writeHead(200);
			req.on('data', function(chunk) {
			  res.write(chunk);
			});
			 req.on('end', function() {
				
				res.end("ok");
			 });
		}
		var uri = url.parse(req.url).pathname;

		appendhtml=false;
		if (uri[uri.length-1]=='/') {
			var newbase=uri.substr(1,uri.length-2);
			rpc_node.rebase(newbase);
			uri+='index.html';
			appendhtml=true;
		}
		
		if (req.url=='/quit') {
			process.exit();
		} else if (req.url=='/login') {
			googlelogin.login(req,res);
			return;
		} else if (req.url.substring(0,15)=='/oauth2callback') {
			googlelogin.callback(req,res);
			return;
		} else if (req.url=='/user') {
			console.log('user',googlelogin.googleuser)
			googlelogin.user(req,res,googlelogin.googleuser);
			return;
		} else if (req.url=='/restart') {
			forcerestart(res);
			return;
		}

		var filename = path.join(process.cwd(), uri);
		
		// deal with missing / for foldername
		if (dirExistsSync(filename) && filename[filename.length-1]!='/' && !appendhtml) {
			res.statusCode = 302;
			console.log('redirect to '+uri+"/");
			res.setHeader("Location", uri+"/");
			res.end();
			return;			
		}
		fs.stat(filename, function(err,stat) {
			if(!stat) {
				console.log("Not exists: " + filename);
				res.writeHead(200, {'Content-Type': 'text/plain'});
				res.write('404 Not Found \n'+filename);
				res.end();
				return;
			}
			servestatic(filename,stat,req,res);
			
 
		}); //end path.exists
	}).listen(port,"0.0.0.0");	
	rpc_node(httpd);  //enable server side API, pass in httpd server handle
}

process.on('uncaughtException', function(err) {
  console.log(err);
  rpc_node.finalize();
});

startserver();
