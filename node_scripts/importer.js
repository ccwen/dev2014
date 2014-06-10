var fs=require('fs');
var D=require('ksana-document');

var importer=function(f,sep) {
	var importXML=D.xml.importXML;
	if (!f || !fs.existsSync(f)) {
		throw "file "+f+" not exists";
		return;
	}
	if (typeof sep=="string") {
		var part=sep.split(".");
		if (part.length!=2) {
			throw "seperator format should be tag.attribute"
			return;
		}
		sep=new RegExp('<'+part[0]+' '+part[1]+'="([^"]*?)"' , 'g');
	}

	var buf=fs.readFileSync(f,'utf8');
	var doc=importXML(buf,{template:'accelon',sep:sep});
	f=f.substring(0,f.length-4);
	f=f.substring(f.lastIndexOf(require("path").sep+1));
	var filename=f+'.kd';
	D.persistent.saveDocument(doc,filename);
	D.persistent.saveDocumentTags(doc,filename+'x');

	var report={pagecount: doc.pageCount};
	return report;
}

module.exports=importer;