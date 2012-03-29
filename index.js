module.exports = function merge (target, src) {
    Object.keys(src).forEach(function (key) {
        if (typeof src[key] !== 'object') {
            target[key] = src[key]
        }
        else {
            if (!target[key] || typeof target[key] !== 'object') {
                target[key] = {}
            }
            merge(target[key], src[key])
        }
    })
}
