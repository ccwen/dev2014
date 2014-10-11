/** @jsx React.DOM */
var markupdialogmixin = {
  getInitialState: function() {
     return {
        className: 'modal fade'
        ,edit:false
      };
  },
  activate:function(opts) {
    this.opts=opts;
    var allow=this.allow?this.allow(opts) : true;
    if (!allow) return;
    if (this.state.immediate) { //immediate execution
      this.execute.apply(this,arguments);
    } else {
      this.setState({edit:false,markup:null});
      this.show();
    }
  },
  edit:function(markup,options) {
    this.opts={options:options};
    this.setState({edit:true,markup:markup});
    this.show();
  },
  show: function() {
    this.setState({ className: 'modal fade show' });
    setTimeout(function() {
      this.setState({ className: 'modal fade show in' });
      if (this.onShow) this.onShow();
    }.bind(this), 0);
  },
  _create:function(e) {
    if (this.create) this.create(this.opts);
    this.hide();
  },
  _save:function(e) {
    if (this.save) this.save(this.opts);
    this.hide();
  },
  _cancel:function(e) {
    if (this.cancel) this.cancel(this.opts);
    this.hide();
  },
  hide: function() {
    // Fade out the help dialog, and totally hide it after a set timeout
    // (once the fade completes)    
    this.setState({ className: 'modal fade show' });
    setTimeout(function() {
      this.setState({ className: 'modal fade' });
      this.opts=null;
    }.bind(this), 400);
  },
  confirmButton:function() {
    if (this.state.edit) {
      return <button type="button" className="btn btn-default" onClick={this._save}>Save</button>
    } else {
      return <button type="button" className="btn btn-default" onClick={this._create}>Create</button>
    }
  },
  renderDialog:function(body) {
    return (
        <div className={this.state.className}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <button type="button" className="close" aria-hidden="true" onClick={this._cancel}>{"\u2716"}</button>
                <h4 className="modal-title">{this.props.title}</h4>
              </div>
              <div className="modal-body">
                {body()}
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-default" onClick={this._cancel}>Close</button>
                {this.confirmButton()}
              </div>
            </div>
          </div>
        </div>
      );
  }
};
module.exports=markupdialogmixin;