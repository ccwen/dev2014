var dictionary=require("./dictionary");
var Dictionary=React.createClass({
	getInitialState:function() {
		return {open:false,content:""}
	},
	openDialog:function() {
		this.refs.dictdialog.getDOMNode().classList.add("opened");
	},
	closeDialog:function() {
		this.refs.dictdialog.getDOMNode().classList.remove("opened");
	},
	foundPossible:function(found) {
		if (!found)return;
		this.setState({open:true,content:found});
		this.openDialog();
	},
	shouldComponentUpdate:function(nextProps,nextState) {
		nextState.open=!!nextProps.tofind;
		if (nextProps.tofind && nextProps.tofind!=this.props.tofind) {
			dictionary.findPossible(nextProps.tofind,nextProps.dictionaries,
				this.foundPossible,this);
		}
		return true;
	},
	render:function() { 
		return <div className="modalDialog " ref="dictdialog">
			<div>
			<a href="#" onClick={this.closeDialog} 
			   title="Close" className="modalClose">X</a>
			   <div dangerouslySetInnerHTML={{__html:this.state.content}}/>
			</div>
		</div>
	}
});
module.exports=Dictionary;