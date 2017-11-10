/**
 * @author Michail Vougioukas
 * @author Philipp Brummer
 */

///<reference path="structures/daq-aggregator/daq-snapshot.ts"/>
///<reference path="structures/daq-aggregator/daq-snapshot-source.d.ts"/>
///<reference path="components/daq-snapshot-view/daq-snapshot-view.d.ts"/>
///<reference path="components/fed-builder/fb-table.tsx"/>
///<reference path="components/filter-farm/fff-table.tsx"/>
///<reference path="utilities/daqview-util.ts"/>

namespace DAQView {

    import DAQAggregatorSnapshot = DAQAggregator.Snapshot;
    import DAQAggregatorSnapshotSource = DAQAggregator.SnapshotSource;

    export class DAQViewReact implements DAQSnapshotView {

        private snapshotViews: {[key: string]: DAQSnapshotView} = {};

        private configuration: DAQViewConfiguration;

        constructor(configuration: DAQViewConfiguration) {
            this.configuration = configuration;
        }

        //calls specific setSnapshot() definition of each daqview component type
        public setSnapshot(snapshot: DAQAggregatorSnapshot, drawPausedPage: boolean, drawZeroDataFlowPage: boolean, drawStaleSnapshot:boolean) {
            DAQViewUtility.forEachOwnObjectProperty(this.snapshotViews, snapshotView => this.snapshotViews[snapshotView].setSnapshot(snapshot, drawPausedPage, drawZeroDataFlowPage, drawStaleSnapshot));
        }

        public prePassElementSpecificData(args: string[]) {
            DAQViewUtility.forEachOwnObjectProperty(this.snapshotViews, snapshotView => this.snapshotViews[snapshotView].prePassElementSpecificData(args));
        }

        public createSnapshotModal(elementName: string) {
            this.createSnapshotModalImpl(elementName);
        }

        private createSnapshotModalImpl(elementName: string) {
            if (this.snapshotViews[elementName]) {
                throw new Error('Element already has a view attached: ' + elementName);
            }
            let newTable = new SnapshotModal(elementName, this.configuration);
            this.snapshotViews[elementName] = newTable;
        }

        public createMetadataTable(elementName: string) {
            this.createMetadataTableImpl(elementName);
        }

        private createMetadataTableImpl(elementName: string) {
            if (this.snapshotViews[elementName]) {
                throw new Error('Element already has a view attached: ' + elementName);
            }
            let newTable = new MetadataTable(elementName, this.configuration);
            this.snapshotViews[elementName] = newTable;
        }

        public createDTTable(elementName: string) {
            this.createDeadTimeTable(elementName);
        }

        private createDeadTimeTable(elementName: string) {
            if (this.snapshotViews[elementName]) {
                throw new Error('Element already has a view attached: ' + elementName);
            }
            let newTable = new DeadTimeTable(elementName, this.configuration);
            this.snapshotViews[elementName] = newTable;
        }

        public createFBTable(elementName: string) {
            this.createFEDBuilderTable(elementName);
        }

        private createFEDBuilderTable(elementName: string) {
            if (this.snapshotViews[elementName]) {
                throw new Error('Element already has a view attached: ' + elementName);
            }
            let newTable = new FEDBuilderTable(elementName, this.configuration);
            this.snapshotViews[elementName] = newTable;
        }

        public createFFFTable(elementName: string) {
            this.createFileBasedFilterFarmTable(elementName);
        }

        private createFileBasedFilterFarmTable(elementName: string) {
            if (this.snapshotViews[elementName]) {
                throw new Error('Element already has a view attached: ' + elementName);
            }
            let newTable = new FileBasedFilterFarmTable(elementName, this.configuration);
            this.snapshotViews[elementName] = newTable;
        }

        public createAboutTable(elementName: string){
            this.createAboutTableImpl(elementName);
        }

        private createAboutTableImpl(elementName: string) {
            if (this.snapshotViews[elementName]) {
                throw new Error('Element already has a view attached: ' + elementName);
            }
            let newTable = new AboutTable(elementName, this.configuration);
            this.snapshotViews[elementName] = newTable;
        }

        public createReplacementForLoader(elementName: string){
            this.createReplacementForLoaderImpl(elementName);
        }

        private createReplacementForLoaderImpl(elementName: string){
            if (this.snapshotViews[elementName]) {
                throw new Error('Element already has a view attached: ' + elementName);
            }
            let newTable = new LoaderReplacement(elementName, this.configuration);
            this.snapshotViews[elementName] = newTable;
        }
    }
}