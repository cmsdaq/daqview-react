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

        constructor() {
        }

        //calls specific setSnapshot() definition of each daqview component type
        public setSnapshot(snapshot: DAQAggregatorSnapshot, drawPausedPage: boolean, drawZeroDataFlowPage: boolean, drawStaleSnapshot:boolean, url: string) {
            DAQViewUtility.forEachOwnObjectProperty(this.snapshotViews, snapshotView => this.snapshotViews[snapshotView].setSnapshot(snapshot, drawPausedPage, drawZeroDataFlowPage, drawStaleSnapshot, url));
        }

        public prePassElementSpecificData(args: string[]) {
            DAQViewUtility.forEachOwnObjectProperty(this.snapshotViews, snapshotView => this.snapshotViews[snapshotView].prePassElementSpecificData(args));
        }

        public createSnapshotModal(elementName: string) {
            this.createSnapshotModalImpl(elementName);
        }

        private createSnapshotModalImpl(elementName: string) {
            let newTable = new SnapshotModal(elementName);
            if (this.snapshotViews[elementName]) {
                throw new Error('Element already has a view attached: ' + elementName);
            }
            this.snapshotViews[elementName] = newTable;
        }

        public createMetadataTable(elementName: string) {
            this.createMetadataTableImpl(elementName);
        }

        private createMetadataTableImpl(elementName: string) {
            let newTable = new MetadataTable(elementName);
            if (this.snapshotViews[elementName]) {
                throw new Error('Element already has a view attached: ' + elementName);
            }
            this.snapshotViews[elementName] = newTable;
        }

        public createDTTable(elementName: string) {
            this.createDeadTimeTable(elementName);
        }

        private createDeadTimeTable(elementName: string) {
            let newTable = new DeadTimeTable(elementName);
            if (this.snapshotViews[elementName]) {
                throw new Error('Element already has a view attached: ' + elementName);
            }
            this.snapshotViews[elementName] = newTable;
        }

        public createFBTable(elementName: string) {
            this.createFEDBuilderTable(elementName);
        }

        private createFEDBuilderTable(elementName: string) {
            let newTable = new FEDBuilderTable(elementName);
            if (this.snapshotViews[elementName]) {
                throw new Error('Element already has a view attached: ' + elementName);
            }
            this.snapshotViews[elementName] = newTable;
        }

        public createFFFTable(elementName: string) {
            this.createFileBasedFilterFarmTable(elementName);
        }

        private createFileBasedFilterFarmTable(elementName: string) {
            let newTable = new FileBasedFilterFarmTable(elementName);
            if (this.snapshotViews[elementName]) {
                throw new Error('Element already has a view attached: ' + elementName);
            }
            this.snapshotViews[elementName] = newTable;
        }

        public createAboutTable(elementName: string){
            this.createAboutTableImpl(elementName);
        }

        private createAboutTableImpl(elementName: string) {
            let newTable = new AboutTable(elementName);
            if (this.snapshotViews[elementName]) {
                throw new Error('Element already has a view attached: ' + elementName);
            }
            this.snapshotViews[elementName] = newTable;
        }

        public createReplacementForLoader(elementName: string){
            this.createReplacementForLoaderImpl(elementName);
        }

        private createReplacementForLoaderImpl(elementName: string){
            let newTable = new LoaderReplacement(elementName);
            if (this.snapshotViews[elementName]) {
                throw new Error('Element already has a view attached: ' + elementName);
            }
            this.snapshotViews[elementName] = newTable;
        }
    }
}