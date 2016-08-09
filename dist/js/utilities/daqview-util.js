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
})(DAQViewUtility || (DAQViewUtility = {}));
