var dictionary=require("./dictionary");
var Dictionary=React.createClass({
	getInitialState:function() {
		return {content:[],message:""};
	},
	openDialog:function() {
		this.refs.dictdialog.getDOMNode().classList.add("opened");
	},
	closeDialog:function() {
		this.refs.dictdialog.getDOMNode().classList.remove("opened");
		this.setState({content:[]});
	},
	foundPossible:function(found,tofind) {
		if (!found || found.length==0) {
			this.setState({message:tofind+" not found",content:[]});
			return;
		}
		this.setState({content:found,message:""});
	},
	shouldComponentUpdate:function(nextProps,nextState) {
		if (nextProps.tofind && this.state.tofind != nextProps.tofind) {
			this.openDialog();
			nextState.tofind=nextProps.tofind;
			nextState.message="暴力亂查中...";
			var that=this;
			setTimeout(function(){
				dictionary.findPossible(nextState.tofind,nextProps.dictionaries,
				that.foundPossible,that);
			},1);
		}
		return true;
	},
	showDictionaries:function() {
		return <a href="#" className="btn btn-warning">丁福保</a>
	},
	contentHTML:function() {
        var output="";
        this.state.content.map(function(o){
            output+= '<span class="dictionary_entry">'+o.pagename+'</span><br/>'+
            '<div class="dictionary_defination">'+o.text.replace(/<.*?>/g,'')+"</div><br/>";
        });	
        return output;
	},
	render:function() { 
		return <div className="modalDialog " ref="dictdialog">
			<div>
			{this.showDictionaries()}
			<a href="#" onClick={this.closeDialog} 
			   title="Close" className="modalClose"> X </a>
			   <div>{this.state.message}</div>
			   <div dangerouslySetInnerHTML={{__html:this.contentHTML()}}/>
			</div>
		</div>
	}
});
module.exports=Dictionary;