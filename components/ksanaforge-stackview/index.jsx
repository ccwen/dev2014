/** @jsx React.DOM */
Require("splitter");
var stackview = React.createClass({
  getInitialState: function() {
    this.start=0;
    return {bar: "world",cur:0};//403
  },
  createSplitter:function() {
    var mainheight=$(this.getDOMNode()).height();
    for (var i=0;i<this.props.views.length-1;i++) {
      var container=$(this.refs["v"+i].getDOMNode());
      var h=$(container.children()[0]).height();
      if (i==0) container.height(mainheight+20);
      container.splitter(
        {type:'h', outline:true, sizeTop: h}
      );      
    }
  },
  componentWillUpdate:function() {
    this.start=0;
  },
  componentDidMount:function() {
    setTimeout(this.createSplitter.bind(this),50);
  },
  componentDidUpdate:function() {
    
  },   
  renderView:function(v) {
    return <div className="splitterPane">{v.content}</div>
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