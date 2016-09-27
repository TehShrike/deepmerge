(function (root, factory) {
    if (typeof define === 'function' && define.amd) {
        define(factory);
    } else if (typeof exports === 'object') {
        module.exports = factory();
    } else {
        root.deepmerge = factory();
    }
}(this, function () {

function isMergeableObject(val) {
    var nonNullObject = val && typeof val === 'object'

    return nonNullObject
        && Object.prototype.toString.call(val) !== '[object RegExp]'
        && Object.prototype.toString.call(val) !== '[object Date]'
}

return function deepmerge(target, source) {
    var array = Array.isArray(source);
    var destination = array ? [] : {};

    if (array) {
        target = target || [];
        destination = destination.concat(target);
        source.forEach(function(e, i) {
            if (typeof destination[i] === 'undefined') {
                destination[i] = e;
            } else if (isMergeableObject(e)) {
                destination[i] = deepmerge(target[i], e);
            } else if (target.indexOf(e) === -1) {
                destination.push(e);
            }
        });
    } else {
        if (isMergeableObject(target)) {
            Object.keys(target).forEach(function (key) {
                destination[key] = target[key];
            })
        }
        Object.keys(source).forEach(function (key) {
            if (!isMergeableObject(source[key]) || !target[key]) {
                destination[key] = source[key];
            } else {
                destination[key] = deepmerge(target[key], source[key]);
            }
        });
    }

    return destination;
}

}));
