"use strict";
/**
 * @author Michail Vougioukas
 * @author Philipp Brummer
 */
var DAQViewUtility;
(function (DAQViewUtility) {
    function forEachOwnObjectProperty(object, callback) {
        for (let property in object) {
            if (object.hasOwnProperty(property)) {
                callback(property);
            }
        }
    }
    DAQViewUtility.forEachOwnObjectProperty = forEachOwnObjectProperty;
    function isPrimitiveType(type) {
        return (type === 'string' || type === 'number' || type === 'boolean');
    }
    function snapshotElementsEqualShallow(a, b) {
        if (a == null) {
            return b == null;
        }
        else if (b == null) {
            return false;
        }
        if (a['@id'] !== b['@id'])
            return false;
        for (let key in a) {
            if (a.hasOwnProperty(key)) {
                let value = a[key];
                let valueType = typeof (value);
                if (value === null || isPrimitiveType(valueType)) {
                    if (value !== b[key])
                        return false;
                }
            }
        }
        return true;
    }
    DAQViewUtility.snapshotElementsEqualShallow = snapshotElementsEqualShallow;
})(DAQViewUtility || (DAQViewUtility = {}));
