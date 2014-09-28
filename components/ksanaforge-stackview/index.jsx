/** @jsx React.DOM */
Require("splitter");

var dummyview = React.createClass({
  render:function() {
    return <div>{this.text}</div>
  }
});
var stackview = React.createClass({
  getInitialState: function() {
    this.start=0;
    return {bar: "world",cur:0};//403
  },
  createSplitter:function() {
    var mainheight=$(this.getDOMNode()).height();
    var mainwidth=$(this.getDOMNode()).width();

    for (var i=0;i<this.props.views.length-1;i++) {
      var container=$(this.refs["v"+i].getDOMNode());
      var h=$(container.children()[0]).height();
      if (i==0) {
        container.height(mainheight);
        container.width(mainwidth);
      }
      container.splitter(
        {type:'h',  sizeTop: h+5} //outline:true to avoid flicker
      );      
    }
  },
  componentWillUpdate:function() {
    this.start=0;
  },
  componentDidMount:function() {
    setTimeout(this.createSplitter,100);
  },
  componentDidUpdate:function() {
    
  },
  action:function() {
    var args=[] , handled=false;
    Array.prototype.push.apply( args, arguments );
    var action=args.shift();
    if (action=="something") {
      handle=false;
    }

    if (!handled) {
      args.unshift(action);
      return this.props.action.apply(this,args);
    }

  },
  getDefaultProps:function() {
    return {
      view: dummyview
    }
  },
  renderView:function(v) {
    return this.props.view({name:v.name,extra:this.props.extra,action:this.action,text:v.content});
    //return <div className="splitterPane" dangerouslySetInnerHTML={{__html:v.content}}></div>
  },
  createNestedView:function() {
    if (this.start>=this.props.views.length) return null;
    return React.DOM.div(
      {ref:"v"+this.start}, 
      this.renderView(this.props.views[this.start++]),
      this.createNestedView() 
    );       
  },  
  render: function() {
    return <div className="stackview">
      {this.createNestedView()}
    </div>
  }
});
module.exports=stackview;