/** @jsx React.DOM */
var html5fs=Require("ksana-document").html5fs;
var filelist = React.createClass({
	getInitialState:function() {
		return {downloading:false,progress:0};
	},
	showLocal:function(f) {
        var classes="btn btn-danger";
        if (this.state.downloading) classes+=" disabled";
	  return <tr><td>{f.filename}</td>
	      <td></td>
	      <td><button className={classes} 
	               onClick={this.deleteFile} data-url={f.url}>Delete</button></td>
	  </tr>
	},  
	showRemote:function(f) { 
	  var classes="btn btn-warning";
	  if (this.state.downloading) classes+=" disabled";
	  return (<tr data-id={f.filename}><td>
	      {f.filename}</td>
	      <td>{f.desc}</td>
	      <td>
	      <span data-filename={f.filename}  data-url={f.url}
	            className={classes}
	            onClick={this.download}>Download</span>
	      </td>
	  </tr>);
	},
	showFile:function(f) {
	//	return <span data-id={f.filename}>{f.url}</span>
		return (f.ready)?this.showLocal(f):this.showRemote(f);
	},
	reloadDir:function() {
		this.props.action("reload");
	},
	download:function(e) {
		var url=e.target.dataset["url"];
		var filename=e.target.dataset["filename"];
		this.setState({downloading:true,progress:0});
		html5fs.download(url,filename,function(){
			this.reloadDir();
			this.setState({downloading:false,progress:1});
			},function(progress,total){
				if (progress==0) {
					this.setState({message:"total "+total})
			 	}
			 	this.setState({progress:progress});
			 	//if user press abort return true
			}
		,this);
	},
	openFile:function(e) {
		var url=e.target.attributes["data-url"].value;
		this.props.action("open",url);
	},
	deleteFile:function( e) {
		var url=e.target.attributes["data-url"].value;
		this.props.action("delete",url);
	},
	allFilesReady:function(e) {
		return this.props.files.every(function(f){ return f.ready});
	},
	dismiss:function() {
		$(this.refs.dialog1.getDOMNode()).modal('hide');
		this.props.action("dismiss");
	},
	showProgress:function() {
	     if (this.state.downloading) {
	      var progress=Math.round(this.state.progress*100);
	      return (
	      <div key="progress" className="progress">
	          <div className="progress-bar" role="progressbar" 
	              aria-valuenow={progress} aria-valuemin="0" 
	              aria-valuemax="100" style={{width: progress+"%"}}>
	            {progress}%
	          </div>
	        </div>
	        );
	      } else {
	      		if ( this.allFilesReady() ) {
	      			return <button onClick={this.dismiss} className="btn btn-success">Ok</button>
	      		} else return null;
	      		
	      }
	},
	render:function() {
	  	return (
		<div ref="dialog1" className="modal fade" data-backdrop="static">
		    <div className="modal-dialog">
		      <div className="modal-content">
		        <div className="modal-header">
		          <h4 className="modal-title">Install Required File</h4>
		        </div>
		        <div className="modal-body">
		        	<table className="table">
		        	<thead>
		        	<tr><td>Filename</td><td></td></tr>
		        	</thead>
		        	<tbody>
		          	{this.props.files.map(this.showFile)}
		          	</tbody>
		          </table>
		        </div>
		        <div className="modal-footer">
		           {this.showProgress()}
		        </div>
		      </div>
		    </div>
		  </div>
		);
	},	
	componentDidMount:function() {
		$(this.refs.dialog1.getDOMNode()).modal('show');
	}
});
/*TODO kdb check version*/
var filemanager = React.createClass({
	getInitialState:function() {
		var dbname=this.props.db;
		var missing=this.missingKdb();
		var silent=this.props.silent||missing.length;
		var files=this.genFileList(html5fs.files,missing);
		return {missing:missing,silent:silent, files:files};
	},
	missingKdb:function() {
		var missing=this.props.needed.filter(function(kdb){
			for (var i in html5fs.files) {
				if (html5fs.files[i][0]==kdb.filename) return false;
			}
			return true;
		},this);
		return missing;
	},

	genFileList:function(existing,missing){
		var out=[];
		for (var i in existing) {
			out.push({filename:existing[i][0], url :existing[i][0], ready:true });
		}
		for (var i in missing) {
			out.push(missing[i]);
		}
		return out;
	},
	reload:function() {
		html5fs.readdir(function(files){
  			this.setState({files:this.genFileList(files,this.missingKdb())});
  		},this);
	 },
	deleteFile:function(fn) {
	  html5fs.rm(fn,function(){
	  	this.reload();
	  },this);
	},
	render:function(){
		if (this.state.missing.length==0 && this.state.silent) {
			setTimeout( this.props.onReady.bind(this),0);
			return <span></span>
		} else {
			return <filelist action={this.action} files={this.state.files}/>
		}
	},

	action:function() {
	  var args = Array.prototype.slice.call(arguments);
	  var type=args.shift();
	  var res=null, that=this;
	  if (type=="delete") {
	    this.deleteFile(args[0]);
	  }  else if (type=="reload") {
	  	this.reload();
	  } else if (type=="dismiss") {
	  	this.props.onReady();
	  }
	}
});

module.exports=filemanager;