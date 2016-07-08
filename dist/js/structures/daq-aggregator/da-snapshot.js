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
//# sourceMappingURL=da-snapshot.js.map