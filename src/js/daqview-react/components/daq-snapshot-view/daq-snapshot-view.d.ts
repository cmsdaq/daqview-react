/**
 * @author Michail Vougioukas
 * @author Philipp Brummer
 */

///<reference path="../../structures/daq-aggregator/daq-snapshot.ts"/>

declare namespace DAQView {

    import DAQAggregatorSnapshot = DAQAggregator.Snapshot;

    export interface SnapshotSourceConfiguration {
        url: string;
    }

    export interface DAQViewLinkConfiguration {
        base_all: string;
        base_fb: string;
        base_fff: string;
        base_fbdt: string;
        controller: string;
    }

    export interface ExternalLinkConfiguration {
        runInfoTimeline?: string;
        daqExpert?: string;
    }

    export interface DAQViewConfiguration {
        snapshotSource: SnapshotSourceConfiguration;
        daqviewLinks: DAQViewLinkConfiguration;
        externalLinks: ExternalLinkConfiguration;

        setupName: string;
    }
    
    export interface DAQSnapshotView {

        //it might make sense to overload setSnapshot()
        setSnapshot(snapshot: DAQAggregatorSnapshot, drawPausedComponent: boolean, drawZeroDataFlowComponent:boolean, drawStaleSnapshot:boolean): void;

        prePassElementSpecificData(args: string []): void;
    }

}