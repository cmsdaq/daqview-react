"use strict";
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
var DAQView;
(function (DAQView) {
    class DAQViewReact {
        constructor() {
            this.snapshotViews = {};
        }
        //calls specific setSnapshot() definition of each daqview component type
        setSnapshot(snapshot, drawPausedPage, drawZeroDataFlowPage, drawStaleSnapshot, url) {
            DAQViewUtility.forEachOwnObjectProperty(this.snapshotViews, snapshotView => this.snapshotViews[snapshotView].setSnapshot(snapshot, drawPausedPage, drawZeroDataFlowPage, drawStaleSnapshot, url));
        }
        prePassElementSpecificData(args) {
            DAQViewUtility.forEachOwnObjectProperty(this.snapshotViews, snapshotView => this.snapshotViews[snapshotView].prePassElementSpecificData(args));
        }
        createSnapshotModal(elementName) {
            this.createSnapshotModalImpl(elementName);
        }
        createSnapshotModalImpl(elementName) {
            let newTable = new DAQView.SnapshotModal(elementName);
            if (this.snapshotViews[elementName]) {
                throw new Error('Element already has a view attached: ' + elementName);
            }
            this.snapshotViews[elementName] = newTable;
        }
        createMetadataTable(elementName) {
            this.createMetadataTableImpl(elementName);
        }
        createMetadataTableImpl(elementName) {
            let newTable = new DAQView.MetadataTable(elementName);
            if (this.snapshotViews[elementName]) {
                throw new Error('Element already has a view attached: ' + elementName);
            }
            this.snapshotViews[elementName] = newTable;
        }
        createDTTable(elementName) {
            this.createDeadTimeTable(elementName);
        }
        createDeadTimeTable(elementName) {
            let newTable = new DAQView.DeadTimeTable(elementName);
            if (this.snapshotViews[elementName]) {
                throw new Error('Element already has a view attached: ' + elementName);
            }
            this.snapshotViews[elementName] = newTable;
        }
        createFBTable(elementName) {
            this.createFEDBuilderTable(elementName);
        }
        createFEDBuilderTable(elementName) {
            let newTable = new DAQView.FEDBuilderTable(elementName);
            if (this.snapshotViews[elementName]) {
                throw new Error('Element already has a view attached: ' + elementName);
            }
            this.snapshotViews[elementName] = newTable;
        }
        createFFFTable(elementName) {
            this.createFileBasedFilterFarmTable(elementName);
        }
        createFileBasedFilterFarmTable(elementName) {
            let newTable = new DAQView.FileBasedFilterFarmTable(elementName);
            if (this.snapshotViews[elementName]) {
                throw new Error('Element already has a view attached: ' + elementName);
            }
            this.snapshotViews[elementName] = newTable;
        }
        createAboutTable(elementName) {
            this.createAboutTableImpl(elementName);
        }
        createAboutTableImpl(elementName) {
            let newTable = new DAQView.AboutTable(elementName);
            if (this.snapshotViews[elementName]) {
                throw new Error('Element already has a view attached: ' + elementName);
            }
            this.snapshotViews[elementName] = newTable;
        }
        createReplacementForLoader(elementName) {
            this.createReplacementForLoaderImpl(elementName);
        }
        createReplacementForLoaderImpl(elementName) {
            let newTable = new DAQView.LoaderReplacement(elementName);
            if (this.snapshotViews[elementName]) {
                throw new Error('Element already has a view attached: ' + elementName);
            }
            this.snapshotViews[elementName] = newTable;
        }
    }
    DAQView.DAQViewReact = DAQViewReact;
})(DAQView || (DAQView = {}));
