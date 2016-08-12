var DAQViewUtility;
(function (DAQViewUtility) {
    function forEachOwnObjectProperty(object, callback) {
        for (var property in object) {
            if (object.hasOwnProperty(property)) {
                callback(property);
            }
        }
    }
    DAQViewUtility.forEachOwnObjectProperty = forEachOwnObjectProperty;
    function isPrimitiveType(type) {
        return (type === 'string' || type === 'number' || type === 'boolean');
    }
    function areEqualShallow(a, b) {
        if (a['@id'] !== b['@id'])
            return false;
        for (var key in a) {
            if (a.hasOwnProperty(key)) {
                var value = a[key];
                var valueType = typeof (value);
                if (value === null || isPrimitiveType(valueType)) {
                    if (value !== b[key])
                        return false;
                }
            }
        }
        return true;
    }
    DAQViewUtility.areEqualShallow = areEqualShallow;
})(DAQViewUtility || (DAQViewUtility = {}));
