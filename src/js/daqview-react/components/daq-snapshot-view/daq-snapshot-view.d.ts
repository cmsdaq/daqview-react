///<reference path="../../structures/daq-aggregator/da-snapshot.ts"/>

declare namespace DAQView {

    import DAQAggregatorSnapshot = DAQAggregator.Snapshot;

    export interface DAQSnapshotView {

        setSnapshot(snapshot: DAQAggregatorSnapshot): void;

    }

}