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
var dictionary=Require("dictionary");
var Showtext = React.createClass({
  getInitialState: function() {
    return {bar: "world"};
  },
  touchstart:function(e) {
    this.touching=e.target;
  },
  touchend:function(e){
    var touching=this.touching;
    this.touching=null;
    if (e.target!=touching) {
      return;
    }
    this.checkUnderTap(e);
  },
  checkUnderTap:function(e) {
    var span=e.target;
    if (span.nodeName!="SPAN") return;
    var possibles=dictionary.findPossible(span,this.props.dictionaries);
    console.log(possibles);
  },
  render: function() {
    var pn=this.props.pagename;
    return ( 
      <div>
        <Controls pagename={this.props.pagename} next={this.props.nextpage} 
        prev={this.props.prevpage} setpage={this.props.setpage}
        syncToc={this.props.syncToc}/>
       
        <div onTouchStart={this.touchstart} 
             onTouchEnd={this.touchend} 
             onClick={this.checkUnderTap} 
             className="bodytext" 
             dangerouslySetInnerHTML={{__html:addbr(this.props.text||"")}} />
      </div>
    );
  }
});
module.exports=Showtext;