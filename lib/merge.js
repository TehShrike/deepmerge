(function() {
  var merge;

  merge = function(target, src) {
    var key, value, _results;
    _results = [];
    for (key in src) {
      value = src[key];
      if (!(value instanceof Object)) {
        _results.push(target[key] = value);
      } else {
        if (!target[key] || !(target[key] instanceof Object)) target[key] = {};
        _results.push(merge(target[key], value));
      }
    }
    return _results;
  };

  module.exports = merge;

}).call(this);
