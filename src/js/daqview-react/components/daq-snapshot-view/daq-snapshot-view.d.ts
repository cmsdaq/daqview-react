///<reference path="../../structures/daq-aggregator/daq-snapshot.ts"/>

declare namespace DAQView {

    import DAQAggregatorSnapshot = DAQAggregator.Snapshot;
    
    export interface DAQSnapshotView {

        //not all views need a pointer to the snapshot, it could make sense to overload setSnapshot()
        setSnapshot(snapshot: DAQAggregatorSnapshot, drawPausedComponent: boolean): void;

    }

}