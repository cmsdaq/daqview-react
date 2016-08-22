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

        export interface SnapshotElement {
            [key: string]: any;

            "@id": string;
        }

        export interface DAQ extends SnapshotElement {
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
            rus?: RU[];

            fedBuilderSummary: FEDBuilderSummary;
            buSummary: BUSummary;
        }

        export interface FEDBuilder extends SnapshotElement {
            name: string;
            ru?: RU;
            subFedbuilders?: SubFEDBuilder[];
        }

        export interface BUSummary extends SnapshotElement {
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

            numFUsHLT: number;
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

        export interface FEDBuilderSummary extends SnapshotElement {
            rate: number;
            throughput: number;

            superFragmentSizeMean: number;
            superFragmentSizeStddev: number;

            deltaEvents: number;

            sumFragmentsInRU: number;
            sumEventsInRU: number;
            sumRequests: number;
        }

        export interface BU extends SnapshotElement {
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

            numFUsHLT: number;
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

        export interface RU extends SnapshotElement {
            hostname: string;
            isEVM: boolean;
            masked: boolean;
            // instance: number;

            stateName?: string;
            errorMsg: string;
            warnMsg: string;
            infoMsg: string;

            rate: number;
            throughput: number;

            superFragmentSizeMean: number;
            superFragmentSizeStddev: number;

            fragmentsInRU: number;
            eventsInRU: number;
            eventCount: number;
            requests: number;

            incompleteSuperFragmentCount: number;

            fedsWithErrors: FED[];

            fedBuilder: FEDBuilder;
        }

        export interface SubFEDBuilder extends SnapshotElement {
            minTrig: number;
            maxTrig: number;
            frlPc?: FRLPc;
            frls?: FRL[];
            feds: FED[];
            ttcPartition?: TTCPartition;
        }

        export interface TTCPartition extends SnapshotElement {
            ttcpNr: number;
            name: string;
            ttsState: string;
            percentWarning: number;
            percentBusy: number;
            fmm?: FMM;
        }

        export interface FMM extends SnapshotElement {
            geoslot: number;
            url: string;
            feds?: FED[];
        }

        export interface FRLPc extends SnapshotElement {
            hostname: string;
            // masked: boolean;
            // frls?: FRL[];
            // crashed: boolean;
        }

        export interface FRL extends SnapshotElement {
            geoSlot: number;
            // type: string;

            feds?: {[key: number]: FED};
            subFedbuilder?: SubFEDBuilder;

            // state: string;
            // substate: string;

            // url: string;
        }

        export interface FED extends SnapshotElement {
            id: number;

            fmm?: FMM;
            frl?: FRL;
            frlIO: number;
            fmmIO: number;

            srcIdExpected: number;

            dependentFeds?: FED[];

            srcIdReceived: number;

            percentBackpressure: number;
            percentWarning: number;
            percentBusy: number;

            ttcp: TTCPartition;
            ttsState?: string;

            numSCRCerrors: number;
            numFCRCerrors: number;
            numTriggers: number;
            eventCounter: number;

            fmmMasked: boolean;
            frlMasked: boolean;

            hasSLINK: boolean;
            hasTTS: boolean;

            ruFedInError: boolean;
            ruFedBXError: number;
            ruFedCRCError: number;
            ruFedDataCorruption: number;
            ruFedOutOfSync: number;
            ruFedWithoutFragments: boolean;

            frl_AccSlinkFullSec: number;
        }

    }

}