module.exports = function merge (target, src) {
  var dst = {}
  if (target && typeof target === 'object') {
    if(Array.isArray(target)) {
      dst = [].concat(target)
        src.forEach(function(e, i){
          if (target.indexOf(e) === -1) {
            dst.push(e);
          }
        })
        return dst
      } else {
        Object.keys(target).forEach(function (key) {
          dst[key] = target[key]
      })
    }
  }

  Object.keys(src).forEach(function (key) {
    if (typeof src[key] !== 'object' || !src[key]) {
      dst[key] = src[key]
    }
    else {
      dst[key] = merge(target[key], src[key])
    }
  })
  return dst
}
