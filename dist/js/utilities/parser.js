var DAQAggregator;
(function (DAQAggregator) {
    var SnapshotParser;
    (function (SnapshotParser) {
        function parse(snapshot) {
            var objectMap = explore(snapshot);
            var daq = scanAndReplace(snapshot, objectMap);
            return new DAQAggregator.Snapshot(daq);
        }
        SnapshotParser.parse = parse;
        function explore(snapshot) {
            return {};
        }
        function scanAndReplace(snapshot, objectMap) {
            return {};
        }
    })(SnapshotParser = DAQAggregator.SnapshotParser || (DAQAggregator.SnapshotParser = {}));
})(DAQAggregator || (DAQAggregator = {}));
//# sourceMappingURL=parser.js.map