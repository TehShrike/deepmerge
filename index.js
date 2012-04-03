module.exports = function merge (target, src) {
  var array = Array.isArray(src)
  var dst = array && [] || {}

  if (array) {
    dst = dst.concat(target || [])
    src.forEach(function(e, i){
      if (!target || target.indexOf(e) === -1) {
        dst.push(e);
      }
    })
  } else {
    if (target && typeof target === 'object') {
      Object.keys(target).forEach(function (key) {
        dst[key] = target[key]
      })
    }

    Object.keys(src).forEach(function (key) {
      if (typeof src[key] !== 'object' || !src[key]) {
        dst[key] = src[key]
      }
      else {
        dst[key] = merge(target[key], src[key])
      }
    })
  }

  return dst
}
