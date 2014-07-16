
var SetIntervalMixin = {
  componentWillMount: function() {
    this.intervals = [];
  },
  setInterval: function() {
    this.intervals.push(setInterval.apply(null, arguments));
  },
  clearInterval:function(handle) {
    var timers=this.intervals.filter(function(I){return I==handle});
    timers.map(clearInterval);
  },
  componentWillUnmount: function() {
    this.intervals.map(clearInterval);
  }
};
var kse=require("../kse");
var YaseMixin = {
  componentWillMount:function() {
    this.$yase=function() { //for backward compatibility
      return kse.$ksana.apply(this,arguments);
    }
    this.$ksana=function() { //new name
      return kse.$ksana.apply(this,arguments);
    }/*
    this.useDB=function() {
      return kse.useDB.apply(this,arguments);
    }
    */
  }
}

module.exports=[YaseMixin,SetIntervalMixin]