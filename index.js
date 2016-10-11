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

function defaultArrayMerge(target, source, optionsArgument) {
    var destination = target.slice()
    var clone = optionsArgument && optionsArgument.clone === true
    source.forEach(function(e, i) {
        if (typeof destination[i] === 'undefined') {
            destination[i] = e
        } else if (isMergeableObject(e)) {
            destination[i] = deepmerge(target[i], e, optionsArgument)
        } else if (target.indexOf(e) === -1) {
            if (clone && isMergeableObject(e)) {
                var emptyTarget = Array.isArray(e) ? [] : {}  
                e = deepmerge(emptyTarget, e)
            }
            destination.push(e)
        }
    })
    return destination
}

function mergeObject(target, source, optionsArgument) {
    var clone = optionsArgument && optionsArgument.clone === true
    var destination = {}
    if (isMergeableObject(target)) {
        Object.keys(target).forEach(function (key) {
            var val = target[key]
            if (clone && isMergeableObject(val)) {
                var emptyTarget = Array.isArray(val) ? [] : {}  
                val = deepmerge(emptyTarget, val) 
            }
            destination[key] = val
        })
    }
    Object.keys(source).forEach(function (key) {
        if (!isMergeableObject(source[key]) || !target[key]) {
            var val = source[key]
            if (clone && isMergeableObject(val)) {
                var emptyTarget = Array.isArray(val) ? [] : {}  
                val = deepmerge(emptyTarget, val) 
            }
            destination[key] = val
        } else {
            destination[key] = deepmerge(target[key], source[key], optionsArgument)
        }
    })
    return destination
}

function deepmerge(target, source, optionsArgument) {
    var array = Array.isArray(source);
    var options = optionsArgument || { arrayMerge: defaultArrayMerge }
    var arrayMerge = options.arrayMerge || defaultArrayMerge

    if (array) {
        target = target || [];
        return arrayMerge(target, source, optionsArgument)
    } else {
        return mergeObject(target, source, optionsArgument)
    }
}

return deepmerge

}));
