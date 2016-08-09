var DAQAggregator;
(function (DAQAggregator) {
    var TYPE_STRING = 'string';
    var TYPE_NUMBER = 'number';
    var TYPE_OBJECT = 'object';
    function randomizeSnapshot(snapshot, maxRecursion, recursion) {
        if (maxRecursion === void 0) { maxRecursion = 10; }
        if (recursion === void 0) { recursion = 0; }
        if (recursion >= maxRecursion) {
            return;
        }
        for (var key in snapshot) {
            if (snapshot.hasOwnProperty(key)) {
                var element = snapshot[key];
                var type = typeof element;
                if (type === TYPE_STRING) {
                }
                else if (type === TYPE_NUMBER) {
                    snapshot[key] = FormatUtility.toFixedNumber(Math.random() * 200, 0);
                }
                else if (type === TYPE_OBJECT) {
                    randomizeSnapshot(snapshot[key], maxRecursion, ++recursion);
                }
            }
        }
    }
    DAQAggregator.randomizeSnapshot = randomizeSnapshot;
})(DAQAggregator || (DAQAggregator = {}));
