"use strict";
/**
 * @author Michail Vougioukas
 * @author Philipp Brummer
 *
 * This model definition should contain only fields and objects which also exist in the Java model of the snapshot *deserializer*.
 *
 * For fields that might exist in the deserializer model but not in the model of the original Aggregator which produced snapshot,
 * it is advised to use question marks to make them optional and to *always* check if null before using, to ensure backwards compatibility of the application.
 */
var DAQAggregator;
(function (DAQAggregator) {
    class Snapshot {
        constructor(snapshotObject) {
            this.processSnapshot(snapshotObject);
        }
        processSnapshot(snapshot) {
            this.snapshot = snapshot;
            this.daq = snapshot;
        }
        getDAQ() {
            return this.daq;
        }
        getUpdateTimestamp() {
            return this.daq.lastUpdate;
        }
    }
    DAQAggregator.Snapshot = Snapshot;
})(DAQAggregator || (DAQAggregator = {}));
