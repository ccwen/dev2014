/** @jsx React.DOM */
  
var trimHit=function(hit) {
  if (hit>999) { 
    return (Math.floor(hit/1000)).toString()+"K+";
  } else return hit.toString();
}
var Ancestors=React.createClass({
  goback:function(e) {
    var n=e.target.dataset["n"]; 
    if (typeof n=="undefined") n=e.target.parentNode.dataset["n"];
    this.props.setCurrent(n); 
  },
  showExcerpt:function(e) {
    var n=parseInt(e.target.parentNode.dataset["n"]);
    e.stopPropagation();
    e.preventDefault();
    this.props.showExcerpt(n);
  }, 
  showHit:function(hit) {
    if (hit)  return <span onClick={this.showExcerpt} className="pull-right badge">{trimHit(hit)}</span>
    else return <span></span>;
  },
  renderAncestor:function(n,idx) {
    var hit=this.props.toc[n].hit;
    return <div key={"a"+n} className="node parent" data-n={n}>{idx+1}.<span className="text" onClick={this.goback} >{this.props.toc[n].text}</span>{this.showHit(hit)}</div>
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
  showHit:function(hit) {
    if (hit)  return <span onClick={this.showExcerpt} className="pull-right badge">{trimHit(hit)}</span>
    else return <span></span>;
  },
  showExcerpt:function(e) {
    var n=parseInt(e.target.parentNode.dataset["n"]);
    e.stopPropagation();
    e.preventDefault();
    this.props.hitClick(n);
  }, 
  openNode:function(haschild) {
    if (haschild) {
      return <button className="btn btn-xs btn-success" onClick={this.open}>＋</button>
    } else {
      return <button className="btn btn-xs btn-default disabled">－</button>
    }    
  },
  renderChild:function(n) {
    var child=this.props.toc[n];
    var hit=this.props.toc[n].hit;
    var classes="node child",haschild=false;  
    //if (child.extra) extra="<extra>"+child.extra+"</extra>";
    if (!child.hasChild) classes+=" nochild";
    else haschild=true;
     
    return <div className={classes} data-n={n}> 
    {this.openNode(haschild)}
    <span className="text"  onClick={this.showText}>{this.props.toc[n].text}</span>{this.showHit(hit)}</div>
  }, 
  showText:function(e) {
    var n=e.target.dataset["n"];
    if (typeof n=="undefined") n=e.target.parentNode.dataset["n"];
    if (this.props.showText) this.props.showText(parseInt(n));
  },
  render:function() {
    if (!this.props.data || !this.props.data.length) return <div></div>;
    return <div>{this.props.data.map(this.renderChild)}</div>
  }
}); 
var stacktoc = React.createClass({
  getInitialState: function() {
    return {bar: "world",tocReady:false,cur:0};//403
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
      if (cur==0) return [];
      var n=cur-1;
      var depth=toc[cur].depth - 1;
      var parents=[];
      while (n>=0 && depth>0) {
        if (toc[n].depth==depth) {
          parents.unshift(n);
          depth--;
        }
        n--;
      }
      parents.unshift(0); //first ancestor is root node
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
  rebuildToc:function() {
    if (!this.state.tocReady && this.props.data) {
      this.buildtoc();
      this.setState({tocReady:true});
    }
  },
  componentDidMount:function() {
    this.rebuildToc();
  },
  componentDidUpdate:function() {
    this.rebuildToc();
  },   
  setCurrent:function(n) {
    n=parseInt(n);
    this.setState({cur:n});
  },

  fillHit:function(nodeIds) {
    if (typeof nodeIds=="number") nodeIds=[nodeIds];
    var toc=this.props.data;
    var hits=this.props.hits;
    var getRange=function(n) {
      var depth=toc[n].depth , nextdepth=toc[n+1].depth;
      if (n==toc.length-1 || n==0) {
          toc[n].end=Math.pow(2, 48);
          return;
      } else  if (nextdepth>depth){
        if (toc[n].next) {
          toc[n].end= toc[toc[n].next].voff;  
        } else { //last sibling
          var next=n+1;
          while (next<toc.length && toc[next].depth>depth) next++;
          if (next==toc.length) toc[n].end=Math.pow(2,48);
          else toc[n].end=toc[next].voff;
        }
        
      } else { //same level or end of sibling
        toc[n].end=toc[n+1].voff;
      }
    }
    var getHit=function(n) {
      var start=toc[n].voff;
      var end=toc[n].end;
      if (n==0) {
        toc[0].hit=hits.length;
      } else {
        var hit=0;
        for (var i=0;i<hits.length;i++) {
          if (hits[i]>=start && hits[i]<end) hit++;
        }
        toc[n].hit=hit;
      }
    }
    nodeIds.forEach(function(n){getRange(n)});
    nodeIds.forEach(function(n){getHit(n)});
  },
  fillHits:function(ancestors,children) {
      this.fillHit(ancestors);
      this.fillHit(children);
      this.fillHit(this.state.cur);
  },
  hitClick:function(n) {
    if (this.props.showExcerpt)  this.props.showExcerpt(n);
  },
  onHitClick:function(e) {
    e.stopPropagation();
    e.preventDefault();
    this.hitClick(this.state.cur);
  },
  showHit:function(hit) {
    if (hit)  return <span onClick={this.onHitClick} className="pull-right badge">{trimHit(hit)}</span>
    else return <span></span>;
  },
  showText:function(e) {
    var n=e.target.dataset["n"];
    if (typeof n=="undefined") n=e.target.parentNode.dataset["n"];
    this.props.showText(parseInt(n));
  },

  render: function() {
    if (!this.props.data || !this.props.data.length) return <div></div>
    var depth=this.props.data[this.state.cur].depth+1;
    var ancestors=this.enumAncestors();
    var children=this.enumChildren();
    var current=this.props.data[this.state.cur];
    if (this.props.hits && this.props.hits.length) this.fillHits(ancestors,children);
    return ( 
      <div className="stacktoc"> 
        <Ancestors showExcerpt={this.hitClick} setCurrent={this.setCurrent} toc={this.props.data} data={ancestors}/>
        <div onClick={this.showText} className="node current" data-n={this.state.cur}><span>{depth}.</span><span className="text">{current.text}</span>{this.showHit(current.hit)}</div>
        <Children showText={this.props.showText} hitClick={this.hitClick} setCurrent={this.setCurrent} toc={this.props.data} data={children}/>
      </div>
    ); 
  }
});
module.exports=stacktoc;