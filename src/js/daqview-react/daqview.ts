/**
 * @author Michail Vougioukas
 * @author Philipp Brummer
 */

namespace DAQView {

    import DAQAggregatorSnapshot = DAQAggregator.Snapshot;
    import DAQAggregatorSnapshotSource = DAQAggregator.SnapshotSource;

    export class DAQViewReact implements DAQSnapshotView {

        private snapshotViews: {[key: string]: DAQSnapshotView} = {};

        constructor() {
        }

        //calls specific setSnapshot() definition of each daqview component type
        public setSnapshot(snapshot: DAQAggregatorSnapshot, drawPausedPage: boolean) {
            DAQViewUtility.forEachOwnObjectProperty(this.snapshotViews, snapshotView => this.snapshotViews[snapshotView].setSnapshot(snapshot, drawPausedPage));
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