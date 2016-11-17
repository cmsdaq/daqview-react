///<reference path="../../structures/daq-aggregator/daq-snapshot.ts"/>

declare namespace DAQView {

    import DAQAggregatorSnapshot = DAQAggregator.Snapshot;
    
    export interface DAQSnapshotView {

        setSnapshot(snapshot: DAQAggregatorSnapshot): void;

    }

}