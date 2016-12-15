/**
 * @author Michail Vougioukas
 * @author Philipp Brummer
 */

///<reference path="daq-snapshot.ts"/>

declare namespace DAQAggregator {

    export interface SnapshotSource {
        updateInterval: number;
        getSourceURL: () => string;
        getSourceURLForGotoRequests: () => string;
        parseSnapshot?: (snapshot: any) => Snapshot;

    }

}