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
    var Snapshot = (function () {
        function Snapshot(snapshotObject) {
            this.processSnapshot(snapshotObject);
        }
        Snapshot.prototype.processSnapshot = function (snapshot) {
            this.snapshot = snapshot;
            this.daq = snapshot;
        };
        Snapshot.prototype.getDAQ = function () {
            return this.daq;
        };
        Snapshot.prototype.getUpdateTimestamp = function () {
            return this.daq.lastUpdate;
        };
        return Snapshot;
    }());
    DAQAggregator.Snapshot = Snapshot;
})(DAQAggregator || (DAQAggregator = {}));
