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
        DAQViewReact.prototype.setSnapshot = function (snapshot) {
            var _this = this;
            DAQViewUtility.forEachOwnObjectProperty(this.snapshotViews, function (snapshotView) { return _this.snapshotViews[snapshotView].setSnapshot(snapshot); });
        };
        DAQViewReact.prototype.createMetadataTable = function (elementName) {
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
            var newTable = new DAQView.FileBasedFilterFarmTable(elementName);
            if (this.snapshotViews[elementName]) {
                throw new Error('Element already has a view attached: ' + elementName);
            }
            this.snapshotViews[elementName] = newTable;
        };
        return DAQViewReact;
    }());
    DAQView.DAQViewReact = DAQViewReact;
})(DAQView || (DAQView = {}));
