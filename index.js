(function (root, factory) {
    if (typeof define === 'function' && define.amd) {
        define(factory);
    } else if (typeof exports === 'object') {
        module.exports = factory();
    } else {
        root.deepmerge = factory();
    }
}(this, function () {

/**
 * To set the default values of options if not passed
 * 
 * @param {Object|Undefuned} options
 * @return {Object}
 */
function setDefaultOptions(options) {

    if (typeof options === 'undefined') {
        options = {};
    }

    // Merge arrays, posibble values (both, target, source)
    if (typeof options.array === 'undefined') {
        options.array = 'both';
    }

    return options;
  
}

return function deepmerge(target, src, options) {

    // To set the default values of options if not passed
    options = setDefaultOptions(options);

    var array = Array.isArray(src);
    var dst = array && [] || {};

    if (array) {
        target = target || [];
        // Include target's array elements
        if (options.array === 'both' || options.array === 'target') {
            dst = dst.concat(target);
        }
        src.forEach(function(e, i) {
            if (typeof dst[i] === 'undefined') {
                dst[i] = e;
            } else if (typeof e === 'object') {
                dst[i] = deepmerge(target[i], e, options);
            } else {
                if (target.indexOf(e) === -1 &&
                   (options.array === 'both' || options.array === 'source')) {
                    dst.push(e);
                }
            }
        });
    } else {
        if (target && typeof target === 'object') {
            Object.keys(target).forEach(function (key) {
                dst[key] = target[key];
            })
        }
        Object.keys(src).forEach(function (key) {
            if (typeof src[key] !== 'object' || !src[key]) {
                dst[key] = src[key];
            }
            else {
                if (!target[key]) {
                    dst[key] = src[key];
                } else {
                    dst[key] = deepmerge(target[key], src[key], options);
                }
            }
        });
    }

    return dst;
}

}));
