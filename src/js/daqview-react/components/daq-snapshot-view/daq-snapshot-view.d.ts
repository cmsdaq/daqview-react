/**
 * @author Michail Vougioukas
 * @author Philipp Brummer
 */

///<reference path="../../structures/daq-aggregator/daq-snapshot.ts"/>

declare namespace DAQView {

    import DAQAggregatorSnapshot = DAQAggregator.Snapshot;
    
    export interface DAQSnapshotView {

        //it might make sense to overload setSnapshot()
        setSnapshot(snapshot: DAQAggregatorSnapshot, drawPausedComponent: boolean, drawZeroDataFlowComponent:boolean, drawStaleSnapshot:boolean, url: string): void;

    }

}