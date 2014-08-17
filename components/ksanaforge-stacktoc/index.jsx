/** @jsx React.DOM */
      
//var othercomponent=Require("other"); 
var Ancestors=React.createClass({
  goback:function(e) {
    var n=e.target.dataset["n"]; 
    if (typeof n=="undefined") n=e.target.parentNode.dataset["n"];
    this.props.setCurrent(n); 
  },
  showHit:function(hit) {
    if (hit>30)  return <span className="pull-right badge">{hit}</span>
    else return <span></span>;
  },
  renderAncestor:function(n,idx) {
    var hit=Math.floor(Math.random()*100);
    return <div key={"a"+n} onClick={this.goback} className="node parent" data-n={n}>{idx+1}.<span>{this.props.toc[n].text}</span>{this.showHit(hit)}</div>
  },
  render:function() {
    if (!this.props.data || !this.props.data.length) return <div></div>;
    return <div>{this.props.data.map(this.renderAncestor)}</div>
  }
});
var Children=React.createClass({
  open:function(e) {
    var n=e.target.parentNode.dataset["n"];
    if (typeof n!=="undefined") this.props.setCurrent(n);
  }, 
  openNode:function() {
    return <button className="btn btn-xs btn-success" onClick={this.open}>...</button>
  },
  renderChild:function(n) {
    var child=this.props.toc[n];
    //var extra="";
    var classes="node child",haschild=false;  
    //if (child.extra) extra="<extra>"+child.extra+"</extra>";
    if (!child.hasChild) classes+=" nochild";
    else haschild=true;

    return <div className={classes} data-n={n}> 
    <span onClick={this.go}>{this.props.toc[n].text}</span>{haschild?this.openNode():""}</div>
  },
  go:function(e) {
    var n=e.target.parentNode.dataset["n"];

  },
  render:function() {
    if (!this.props.data || !this.props.data.length) return <div></div>;
    return <div>{this.props.data.map(this.renderChild)}</div>
  }
});
var stacktoc = React.createClass({
  getInitialState: function() {
    return {bar: "world",tocReady:false,cur:327};//403
  },
  buildtoc: function() {
      var toc=this.props.data;
      if (!toc || !toc.length) return;      var depths=[];
      var prev=0;
      for (var i=0;i<toc.length;i++) {
        var depth=toc[i].depth;
        if (prev>depth) { //link to prev sibling
          if (depths[depth]) toc[depths[depth]].next = i;
          for (var j=depth;j<prev;j++) depths[j]=0;
        }
        if (i<toc.length-1 && toc[i+1].depth>depth) {
          toc[i].hasChild=true;
        }
        depths[depth]=i;
        prev=depth;
      }
    },
    enumAncestors:function() {
      var toc=this.props.data;
      if (!toc || !toc.length) return;
      var cur=this.state.cur;
      var n=cur-1;
      var depth=toc[cur].depth - 1;
      var parents=[];
      while (n>=0 && depth>=0) {
        if (toc[n].depth==depth) {
          parents.unshift(n);
          depth--;
        }
        n--;
      }
      return parents;
    },
    enumChildren : function() {
      var cur=this.state.cur;
      var toc=this.props.data;
      if (!toc || !toc.length) return;
      if (toc[cur+1].depth!= 1+toc[cur].depth) return ;  // no children node
      var n=cur+1;
      var child=toc[n];
      var children=[];
      while (child) {
        children.push(n);
        var next=toc[n+1];
        if (!next) break;
        if (next.depth==child.depth) {
          n++;
        } else if (next.depth>child.depth) {
          n=child.next;
        } else break;
        if (n) child=toc[n];else break;
      }
      return children;
    },
  componentDidUpdate:function() {
    if (!this.state.tocReady && this.props.data) {
      this.buildtoc();
      this.setState({tocReady:true});
    }
  }, 
  setCurrent:function(n) {
    n=parseInt(n);
    this.setState({cur:n});
  },
  render: function() {
    if (!this.props.data || !this.props.data.length) return <div></div>
    var depth=this.props.data[this.state.cur].depth+1;
    return (
      <div> 
        <Ancestors setCurrent={this.setCurrent} toc={this.props.data} data={this.enumAncestors()}/>
        <div className="node current" n={this.state.cur}><span>{depth}.</span>{this.props.data[this.state.cur].text}</div>
        <Children setCurrent={this.setCurrent} toc={this.props.data} data={this.enumChildren()}/>
      </div>
    ); 
  }
});
module.exports=stacktoc;