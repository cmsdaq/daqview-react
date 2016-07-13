namespace DAQAggregator {

    export class Snapshot {
        private snapshot: any;
        private daq: Snapshot.DAQ;

        constructor(snapshotObject: {[key: string]: any}) {
            this.processSnapshot(snapshotObject);
        }

        private processSnapshot(snapshot: any) {
            this.snapshot = snapshot;
            this.daq = snapshot;
        }

        public getDAQ() {
            return this.daq;
        }

        public getUpdateTimestamp() {
            return this.daq.lastUpdate;
        }
    }

    export namespace Snapshot {

        export interface DAQ {
            [key: string]: any;

            lastUpdate: number;

            sessionId: number;
            runNumber: number;
            dpsetPath: string;

            daqState: string;
            levelZeroState: string;
            // lhcMachineMode: string;
            // lhcBeamMode: string;

            fedBuilders: FEDBuilder[];
            bus?: BU[];

            fedBuilderSummary: FEDBuilderSummary;
            buSummary: BUSummary;
        }

        export interface FEDBuilder {
            [key: string]: any;

            name: string;
            ru?: RU;
            subFedbuilders?: SubFEDBuilder[];
        }

        export interface BUSummary {
            [key: string]: any;

            rate: number;
            throughput: number;

            eventSizeMean: number;
            eventSizeStddev: number;

            numEvents: number;
            numEventsInBU: number;

            priority: number;

            numRequestsSent: number;
            numRequestsUsed: number;
            numRequestsBlocked: number;

            numFUsHlt: number;
            numFUsCrashed: number;
            numFUsStale: number;
            numFUsCloud: number;

            ramDiskUsage: number;
            ramDiskTotal: number;
            numFiles: number;

            numLumisectionsWithFiles: number;
            currentLumisection: number;

            numLumisectionsForHLT: number;
            numLumisectionsOutHLT: number;

            fuOutputBandwidthInMB: number;
        }

        export interface FEDBuilderSummary {
            [key: string]: any;

            rate: number;
            throughput: number;

            superFragmentSizeMean: number;
            superFragmentSizeStddev: number;

            deltaEvents: number;

            sumFragmentsInRU: number;
            sumEventsInRU: number;
            sumRequests: number;
        }

        export interface BU {
            [key: string]: any;

            hostname: string;

            rate: number;
            throughput: number;

            eventSizeMean: number;
            eventSizeStddev: number;

            numEvents: number;
            numEventsInBU: number;

            priority: number;

            numRequestsSent: number;
            numRequestsUsed: number;
            numRequestsBlocked: number;

            numFUsHlt: number;
            numFUsCrashed: number;
            numFUsStale: number;
            numFUsCloud: number;

            ramDiskUsage: number;
            ramDiskTotal: number;
            numFiles: number;

            numLumisectionsWithFiles: number;
            currentLumisection: number;

            numLumisectionsForHLT: number;
            numLumisectionsOutHLT: number;

            fuOutputBandwidthInMB: number;
        }

        export interface RU {
            [key: string]: any;

            hostname: string;
            isEVM: boolean;
            // masked: boolean;
            // instance: number;

            // stateName: string;
            errorMsg: string;
            warnMsg: string;
            infoMsg: string;

            rate: number;
            throughput: number;

            superFragmentSizeMean: number;
            superFragmentSizeStddev: number;

            fragmentsInRU: number;
            eventsInRU: number;
            requests: number;

            // #events missing?

            // status: string;
            // incompleteSuperFragmentCount: number;

        }

        export interface SubFEDBuilder {
            [key: string]: any;

            minTrig: number;
            maxTrig: number;
            frlPc?: FRLPc;
            frls?: FRL[];
            ttcPartition?: TTCPartition;
        }

        export interface TTCPartition {
            [key: string]: any;

            name: string;
            ttsState: string;
            percentWarning: number;
            percentBusy: number;
            fmm?: FMM;
        }

        export interface FMM {
            [key: string]: any;

            geoslot: number;
            url: string;
            feds?: FED[];
        }

        export interface FRLPc {
            [key: string]: any;

            hostname: string;
            // masked: boolean;
            // frls?: FRL[];
            // crashed: boolean;
        }

        export interface FRL {
            [key: string]: any;

            geoSlot: number;
            // type: string;

            feds?: {[key: number]: FED};

            // state: string;
            // substate: string;

            // url: string;
        }

        export interface FED {
            [key: string]: any;

            id: number;

            fmm?: FMM;
            frlIO: number;
            fmmIO: number;

            srcIdExpected: number;

            mainFeds?: FED[];

            srcIdReceived: number;

            percentBackpressure: number;
            percentWarning: number;
            percentBusy: number;

            ttsState?: string;

            numSCRCerrors: number;
            numFRCerrors: number;
            numTriggers: number;
            eventCounter: number;

            fmmMasked: boolean;
            frlMasked: boolean;

            hasSLINK: boolean;
            hasTTS: boolean;
        }

    }

}