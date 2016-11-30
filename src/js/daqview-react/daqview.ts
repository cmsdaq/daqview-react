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

        public setSnapshot(snapshot: DAQAggregatorSnapshot) {
            DAQViewUtility.forEachOwnObjectProperty(this.snapshotViews, snapshotView => this.snapshotViews[snapshotView].setSnapshot(snapshot));
        }

        public createMetadataTable(elementName: string) {
            let newTable = new MetadataTable(elementName);
            if (this.snapshotViews[elementName]) {
                throw new Error('Element already has a view attached: ' + elementName);
            }
            this.snapshotViews[elementName] = newTable;
        }

        public createFBTable(elementName: string) {
            this.createFEDBuilderTable(elementName);
        }

        public createFEDBuilderTable(elementName: string) {
            let newTable = new FEDBuilderTable(elementName);
            if (this.snapshotViews[elementName]) {
                throw new Error('Element already has a view attached: ' + elementName);
            }
            this.snapshotViews[elementName] = newTable;
        }

        public createFFFTable(elementName: string) {
            this.createFileBasedFilterFarmTable(elementName);
        }

        public createFileBasedFilterFarmTable(elementName: string) {
            let newTable = new FileBasedFilterFarmTable(elementName);
            if (this.snapshotViews[elementName]) {
                throw new Error('Element already has a view attached: ' + elementName);
            }
            this.snapshotViews[elementName] = newTable;
        }

        public createAboutTable(elementName: string){
            this.createAboutTableImpl(elementName);
        }

        public createAboutTableImpl(elementName: string) {
            let newTable = new AboutTable(elementName);
            if (this.snapshotViews[elementName]) {
                throw new Error('Element already has a view attached: ' + elementName);
            }
            this.snapshotViews[elementName] = newTable;
        }
    }
}