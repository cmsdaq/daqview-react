"use strict";
/**
 * @author Philipp Brummer
 */
var DAQAggregator;
(function (DAQAggregator) {
    const TYPE_STRING = 'string';
    const TYPE_NUMBER = 'number';
    const TYPE_OBJECT = 'object';
    function randomizeSnapshot(snapshot, maxRecursion = 10, recursion = 0) {
        if (recursion >= maxRecursion) {
            return;
        }
        for (let key in snapshot) {
            if (snapshot.hasOwnProperty(key)) {
                let element = snapshot[key];
                let type = typeof element;
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
