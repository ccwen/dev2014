var express = require('express')
  , app     = express()
  , PouchDB = require('pouchdb');

var wwwroot=require("path").join(__dirname,"../");
var TempPouchDB = PouchDB.defaults({prefix: wwwroot+'/pouchdb/'});

app.use(require("morgan")('tiny'));
//app.use(express.urlencoded());
//app.use(express.multipart());

app.use('/pouchdb', require('express-pouchdb')(TempPouchDB));

app.use(require("serve-static")(wwwroot));
new require("pouchdb")("pncdemo");
var argv = require("minimist")(process.argv.slice(2));
var port= parseInt(argv.port|| argv.p || "2556"); 

console.log("serving port",port,"wwwroot",wwwroot);
app.listen(port);