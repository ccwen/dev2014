var Controls = React.createClass({
  getInitialState: function() {
    return {pagename:this.props.pagename};
  },
  updateValue:function(e){
    if (e.key!="Enter") return;
    var newpagename=this.refs.pagename.getDOMNode().value;
    this.props.setpage(newpagename);
  },  
  shouldComponentUpdate:function(nextProps,nextState) {
    this.refs.pagename.getDOMNode().value=nextProps.pagename;
    nextState.pagename=nextProps.pagename;
    return true;
  },
  gotoToc:function() {
    this.props.syncToc(); 
  },
  render: function() {   
   return <div className="inputs">
      <button onClick={this.props.prev}>←</button>
       <input size="8" type="text" ref="pagename" onKeyUp={this.updateValue}></input>
      <button onClick={this.props.next}>→</button>
      <button onClick={this.gotoToc}>Toc</button>
      </div>
  }  
});
var addbr=function(t) {
  return t.split("\n").map(function(line){return line+" <br/>"}).join("\n");
};
var Showtext = React.createClass({
  getInitialState: function() {
    return {bar: "world"};
  },
  render: function() {
    var pn=this.props.pagename;
    return ( 
      <div>
        <Controls pagename={this.props.pagename} next={this.props.nextpage} 
        prev={this.props.prevpage} setpage={this.props.setpage}
        syncToc={this.props.syncToc}/>
       
        <div className="bodytext" dangerouslySetInnerHTML={{__html:addbr(this.props.text||"")}} />
      </div>
    );
  }
});
module.exports=Showtext;