/** @jsx React.DOM */
var markupdialogmixin = {
  getInitialState: function() {
     return {
        className: 'modal fade'
      };
  },
  activate:function(opts) {
    this.opts=opts;
    var allow=this.allow?this.allow(opts) : true;
    if (!allow) return;
    if (this.state.immediate) { //immediate execution
      this.execute.apply(this,arguments);
    } else {
      this.show.apply(this,arguments);
    }
  },
  show: function() {
    this.setState({ className: 'modal fade show' });
    setTimeout(function() {
      this.setState({ className: 'modal fade show in' });
      if (this.onShow) this.onShow();
    }.bind(this), 0);
  },
  _ok:function(e) {
    if (this.ok) this.ok(this.opts);
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
                <button type="button" className="btn btn-default" onClick={this._ok}>Ok</button>
              </div>
            </div>
          </div>
        </div>
      );
  }
};
module.exports=markupdialogmixin;