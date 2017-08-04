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
    var DAQViewReact = (function () {
        function DAQViewReact() {
            this.snapshotViews = {};
        }
        //calls specific setSnapshot() definition of each daqview component type
        DAQViewReact.prototype.setSnapshot = function (snapshot, drawPausedPage, drawZeroDataFlowPage, drawStaleSnapshot, url) {
            var _this = this;
            DAQViewUtility.forEachOwnObjectProperty(this.snapshotViews, function (snapshotView) { return _this.snapshotViews[snapshotView].setSnapshot(snapshot, drawPausedPage, drawZeroDataFlowPage, drawStaleSnapshot, url); });
        };
        DAQViewReact.prototype.prePassElementSpecificData = function (args) {
            var _this = this;
            DAQViewUtility.forEachOwnObjectProperty(this.snapshotViews, function (snapshotView) { return _this.snapshotViews[snapshotView].prePassElementSpecificData(args); });
        };
        DAQViewReact.prototype.createSnapshotModal = function (elementName) {
            this.createSnapshotModalImpl(elementName);
        };
        DAQViewReact.prototype.createSnapshotModalImpl = function (elementName) {
            var newTable = new DAQView.SnapshotModal(elementName);
            if (this.snapshotViews[elementName]) {
                throw new Error('Element already has a view attached: ' + elementName);
            }
            this.snapshotViews[elementName] = newTable;
        };
        DAQViewReact.prototype.createMetadataTable = function (elementName) {
            this.createMetadataTableImpl(elementName);
        };
        DAQViewReact.prototype.createMetadataTableImpl = function (elementName) {
            var newTable = new DAQView.MetadataTable(elementName);
            if (this.snapshotViews[elementName]) {
                throw new Error('Element already has a view attached: ' + elementName);
            }
            this.snapshotViews[elementName] = newTable;
        };
        DAQViewReact.prototype.createFBTable = function (elementName) {
            this.createFEDBuilderTable(elementName);
        };
        DAQViewReact.prototype.createFEDBuilderTable = function (elementName) {
            var newTable = new DAQView.FEDBuilderTable(elementName);
            if (this.snapshotViews[elementName]) {
                throw new Error('Element already has a view attached: ' + elementName);
            }
            this.snapshotViews[elementName] = newTable;
        };
        DAQViewReact.prototype.createFFFTable = function (elementName) {
            this.createFileBasedFilterFarmTable(elementName);
        };
        DAQViewReact.prototype.createFileBasedFilterFarmTable = function (elementName) {
            var newTable = new DAQView.FileBasedFilterFarmTable(elementName);
            if (this.snapshotViews[elementName]) {
                throw new Error('Element already has a view attached: ' + elementName);
            }
            this.snapshotViews[elementName] = newTable;
        };
        DAQViewReact.prototype.createAboutTable = function (elementName) {
            this.createAboutTableImpl(elementName);
        };
        DAQViewReact.prototype.createAboutTableImpl = function (elementName) {
            var newTable = new DAQView.AboutTable(elementName);
            if (this.snapshotViews[elementName]) {
                throw new Error('Element already has a view attached: ' + elementName);
            }
            this.snapshotViews[elementName] = newTable;
        };
        DAQViewReact.prototype.createReplacementForLoader = function (elementName) {
            this.createReplacementForLoaderImpl(elementName);
        };
        DAQViewReact.prototype.createReplacementForLoaderImpl = function (elementName) {
            var newTable = new DAQView.LoaderReplacement(elementName);
            if (this.snapshotViews[elementName]) {
                throw new Error('Element already has a view attached: ' + elementName);
            }
            this.snapshotViews[elementName] = newTable;
        };
        return DAQViewReact;
    }());
    DAQView.DAQViewReact = DAQViewReact;
})(DAQView || (DAQView = {}));
