/**
 * @author Michail Vougioukas
 * @author Philipp Brummer
 *
 * This model definition should contain only fields and objects which also exist in the Java model of the snapshot *deserializer*.
 *
 * For fields that might exist in the deserializer model but not in the model of the original Aggregator which produced snapshot,
 * it is advised to use question marks to make them optional and to *always* check if null before using, to ensure backwards compatibility of the application.
 */

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

            "@id"?: string;
        }

        export interface DAQ extends SnapshotElement {
            lastUpdate: number;

            sessionId: number;
            runNumber: number;
            runStart: number;
            runDurationInMillis: number;
            dpsetPath: string;

            daqAggregatorProducer: string;

            daqState: string;
            levelZeroState: string;
            levelZeroStateEntry: number;
            lhcMachineMode: string;
            lhcBeamMode: string;

            fedBuilders: FEDBuilder[];
            bus?: BU[];
            rus?: RU[];

            fedBuilderSummary: FEDBuilderSummary;
            buSummary: BUSummary;

            tcdsGlobalInfo?: TCDSGlobalInfo;

        }

        export interface TCDSGlobalInfo extends SnapshotElement {
            tcdsControllerContext? : string;
            tcdsControllerServiceName? : string;
            globalTtsStates?: {[key:string]: TTSState};
            deadTimes?: DeadTimes;
        }

        export interface TTSState extends SnapshotElement {
            state: string;
            percentWarning: number;
            percentBusy: number;
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

            busNoRate: number; //locally calculated
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

            rusMasked: number; //locally calculated
        }

        export interface BU extends SnapshotElement {
            hostname: string;
            port: number;

            stateName: string;

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

            crashed: boolean;
        }

        export interface RU extends SnapshotElement {
            hostname: string;
            port: number;
            isEVM: boolean;
            masked: boolean;
            // instance: number;

            stateName?: string;
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

            crashed: boolean;
        }

        export interface SubFEDBuilder extends SnapshotElement {
            minTrig: number;
            maxTrig: number;
            frlPc?: FRLPc;
            frls?: FRL[];
            feds: FED[];
            ttcPartition?: TTCPartition;
        }

        export interface FMMInfo extends SnapshotElement{
            nullCause: string;
        }

        export interface TCDSPartitionInfo extends SnapshotElement{
            nullCause: string;
            triggerName: string;
            piContext: string;
            icinr: number;
            pmnr: number;
        }

        export interface TTCPartition extends SnapshotElement {
            ttcpNr: number;
            name: string;
            ttsState: string;
            tcds_pm_ttsState: string;
            tcds_apv_pm_ttsState: string;
            percentWarning: number;
            percentBusy: number;
            fmm?: FMM;
            masked: boolean;
            topFMMInfo: FMMInfo;
            tcdsPartitionInfo?: TCDSPartitionInfo;
        }

        export interface FMMApplication extends SnapshotElement {
            crashed: boolean;
            hostname: string;
        }

        export interface FMM extends SnapshotElement {
            geoslot: number;
            url: string;
            feds?: FED[];
            stateName: string;
            fmmApplication: FMMApplication;
        }

        export interface FRLPc extends SnapshotElement {
            hostname: string;
            port: number;
            // masked: boolean;
            // frls?: FRL[];
            crashed: boolean;
        }

        export interface FRL extends SnapshotElement {
            geoSlot: number;
            // type: string;

            feds?: {[key: string]: FED};
            subFedbuilder?: SubFEDBuilder;

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

            isPseudoFed: boolean; //variable set locally, using context information, for displays reason
        }

        export interface DeadTimes extends SnapshotElement {
            apve?: number;
            beamactive_apve?: number;

            bx_mask?: number;
            beamactive_bx_mask?: number;

            calib?: number;
            beamactive_calib?: number;

            daq_bp?: number;
            beamactive_daq_bp?: number;

            fw_pause?: number;
            beamactive_fw_pause?: number;

            retri?: number;
            beamactive_retri?: number;

            sw_pause?: number;
            beamactive_sw_pause?: number;

            total?: number;
            beamactive_total?: number;

            trg_rules?: number;
            beamactive_trg_rules?: number;

            tts?: number;
            beamactive_tts?: number;
        }



    }

}