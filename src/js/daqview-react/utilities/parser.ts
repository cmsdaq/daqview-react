namespace DAQAggregator {

    export namespace SnapshotParser {

        export function parse(snapshot: {}): Snapshot {
            let objectMap: {} = explore(snapshot);
            let daq: {} = scanAndReplace(snapshot, objectMap);
            return new Snapshot(daq);
        }

        function explore(snapshot: {}): {} {
            return {};
        }

        function scanAndReplace(snapshot: {}, objectMap: {}): {} {
            return {};
        }

    }

}