///<reference path="da-snapshot.ts"/>

declare namespace DAQAggregator {

    export interface SnapshotSource {
        updateInterval: number;
        getSourceURL: () => string;
        parseSnapshot?: (snapshot: any) => Snapshot;
    }

}