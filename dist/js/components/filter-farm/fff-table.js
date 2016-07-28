///<reference path="../../structures/daq-aggregator/da-snapshot.ts"/>
///<reference path="../daq-snapshot-view/daq-snapshot-view.d.ts"/>
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
///<reference path="../../utilities/format-util.ts"/>
var DAQView;
(function (DAQView) {
    var FileBasedFilterFarmTable = (function () {
        function FileBasedFilterFarmTable(htmlRootElementName) {
            this.sortFunction = FFFTableSortFunctions.NONE;
            this.currentSorting = {
                'BU': DAQView.Sorting.None,
                'rate (kHz)': DAQView.Sorting.None,
                'thru (MB/s)': DAQView.Sorting.None,
                'size (kB)': DAQView.Sorting.None,
                '#events': DAQView.Sorting.None,
                '#evts in BU': DAQView.Sorting.None,
                'priority': DAQView.Sorting.None,
                '#req. sent': DAQView.Sorting.None,
                '#req. used': DAQView.Sorting.None,
                '#req. blocked': DAQView.Sorting.None,
                '#FUs HLT': DAQView.Sorting.None,
                '#FUs crash': DAQView.Sorting.None,
                '#FUs stale': DAQView.Sorting.None,
                '#FUs cloud': DAQView.Sorting.None,
                'RAM disk usage': DAQView.Sorting.None,
                '#files': DAQView.Sorting.None,
                '#LS w/ files': DAQView.Sorting.None,
                'current LS': DAQView.Sorting.None,
                '#LS for HLT': DAQView.Sorting.None,
                '#LS out HLT': DAQView.Sorting.None,
                'b/w out (MB/s)': DAQView.Sorting.None
            };
            this.htmlRootElement = document.getElementById(htmlRootElementName);
        }
        FileBasedFilterFarmTable.prototype.setSnapshot = function (snapshot) {
            this.snapshot = snapshot;
            var sortedSnapshot = this.sort(snapshot);
            var daq = sortedSnapshot.getDAQ();
            var fileBasedFilterFarmTableRootElement = React.createElement(FileBasedFilterFarmTableElement, {tableObject: this, bus: daq.bus, buSummary: daq.buSummary});
            ReactDOM.render(fileBasedFilterFarmTableRootElement, this.htmlRootElement);
        };
        FileBasedFilterFarmTable.prototype.setSortFunction = function (sortFunction) {
            this.sortFunction = sortFunction;
            this.setSnapshot(this.snapshot);
        };
        FileBasedFilterFarmTable.prototype.sort = function (snapshot) {
            return this.sortFunction(snapshot);
        };
        FileBasedFilterFarmTable.prototype.setCurrentSorting = function (headerName, sorting) {
            var _this = this;
            DAQViewUtility.forEachOwnObjectProperty(this.currentSorting, function (header) { return _this.currentSorting[header] = DAQView.Sorting.None; });
            this.currentSorting[headerName] = sorting;
        };
        FileBasedFilterFarmTable.prototype.getCurrentSorting = function (headerName) {
            return this.currentSorting[headerName];
        };
        return FileBasedFilterFarmTable;
    }());
    DAQView.FileBasedFilterFarmTable = FileBasedFilterFarmTable;
    var FFFTableSortFunctions;
    (function (FFFTableSortFunctions) {
        function NONE(snapshot) {
            return snapshot;
        }
        FFFTableSortFunctions.NONE = NONE;
        function BU_SORT(snapshot, attribute, descending) {
            var daq = snapshot.getDAQ();
            var bus = daq.bus;
            bus.sort(function (firstBU, secondBU) {
                var firstBUValue = firstBU[attribute];
                var secondBUValue = secondBU[attribute];
                if (firstBUValue > secondBUValue) {
                    return (descending ? -1 : 1);
                }
                else if (firstBUValue < secondBUValue) {
                    return (descending ? 1 : -1);
                }
                else {
                    return 0;
                }
            });
            daq.bus = bus;
            return snapshot;
        }
        function BU_HOSTNAME_ASC(snapshot) {
            return BU_SORT(snapshot, 'hostname', false);
        }
        FFFTableSortFunctions.BU_HOSTNAME_ASC = BU_HOSTNAME_ASC;
        function BU_HOSTNAME_DESC(snapshot) {
            return BU_SORT(snapshot, 'hostname', true);
        }
        FFFTableSortFunctions.BU_HOSTNAME_DESC = BU_HOSTNAME_DESC;
        function BU_RATE_ASC(snapshot) {
            return BU_SORT(snapshot, 'rate', false);
        }
        FFFTableSortFunctions.BU_RATE_ASC = BU_RATE_ASC;
        function BU_RATE_DESC(snapshot) {
            return BU_SORT(snapshot, 'rate', true);
        }
        FFFTableSortFunctions.BU_RATE_DESC = BU_RATE_DESC;
        function BU_THROUGHPUT_ASC(snapshot) {
            return BU_SORT(snapshot, 'throughput', false);
        }
        FFFTableSortFunctions.BU_THROUGHPUT_ASC = BU_THROUGHPUT_ASC;
        function BU_THROUGHPUT_DESC(snapshot) {
            return BU_SORT(snapshot, 'throughput', true);
        }
        FFFTableSortFunctions.BU_THROUGHPUT_DESC = BU_THROUGHPUT_DESC;
        function BU_EVENTSIZEMEAN_ASC(snapshot) {
            return BU_SORT(snapshot, 'eventSizeMean', false);
        }
        FFFTableSortFunctions.BU_EVENTSIZEMEAN_ASC = BU_EVENTSIZEMEAN_ASC;
        function BU_EVENTSIZEMEAN_DESC(snapshot) {
            return BU_SORT(snapshot, 'eventSizeMean', true);
        }
        FFFTableSortFunctions.BU_EVENTSIZEMEAN_DESC = BU_EVENTSIZEMEAN_DESC;
        function BU_NUMEVENTS_ASC(snapshot) {
            return BU_SORT(snapshot, 'numEvents', false);
        }
        FFFTableSortFunctions.BU_NUMEVENTS_ASC = BU_NUMEVENTS_ASC;
        function BU_NUMEVENTS_DESC(snapshot) {
            return BU_SORT(snapshot, 'numEvents', true);
        }
        FFFTableSortFunctions.BU_NUMEVENTS_DESC = BU_NUMEVENTS_DESC;
        function BU_NUMEVENTSINBU_ASC(snapshot) {
            return BU_SORT(snapshot, 'numEventsInBU', false);
        }
        FFFTableSortFunctions.BU_NUMEVENTSINBU_ASC = BU_NUMEVENTSINBU_ASC;
        function BU_NUMEVENTSINBU_DESC(snapshot) {
            return BU_SORT(snapshot, 'numEventsInBU', true);
        }
        FFFTableSortFunctions.BU_NUMEVENTSINBU_DESC = BU_NUMEVENTSINBU_DESC;
        function BU_PRIORITY_ASC(snapshot) {
            return BU_SORT(snapshot, 'priority', false);
        }
        FFFTableSortFunctions.BU_PRIORITY_ASC = BU_PRIORITY_ASC;
        function BU_PRIORITY_DESC(snapshot) {
            return BU_SORT(snapshot, 'priority', true);
        }
        FFFTableSortFunctions.BU_PRIORITY_DESC = BU_PRIORITY_DESC;
        function BU_NUMREQUESTSSENT_ASC(snapshot) {
            return BU_SORT(snapshot, 'numRequestsSent', false);
        }
        FFFTableSortFunctions.BU_NUMREQUESTSSENT_ASC = BU_NUMREQUESTSSENT_ASC;
        function BU_NUMREQUESTSSENT_DESC(snapshot) {
            return BU_SORT(snapshot, 'numRequestsSent', true);
        }
        FFFTableSortFunctions.BU_NUMREQUESTSSENT_DESC = BU_NUMREQUESTSSENT_DESC;
        function BU_NUMREQUESTSUSED_ASC(snapshot) {
            return BU_SORT(snapshot, 'numRequestsUsed', false);
        }
        FFFTableSortFunctions.BU_NUMREQUESTSUSED_ASC = BU_NUMREQUESTSUSED_ASC;
        function BU_NUMREQUESTSUSED_DESC(snapshot) {
            return BU_SORT(snapshot, 'numRequestsUsed', true);
        }
        FFFTableSortFunctions.BU_NUMREQUESTSUSED_DESC = BU_NUMREQUESTSUSED_DESC;
        function BU_NUMREQUESTSBLOCKED_ASC(snapshot) {
            return BU_SORT(snapshot, 'numRequestsBlocked', false);
        }
        FFFTableSortFunctions.BU_NUMREQUESTSBLOCKED_ASC = BU_NUMREQUESTSBLOCKED_ASC;
        function BU_NUMREQUESTSBLOCKED_DESC(snapshot) {
            return BU_SORT(snapshot, 'numRequestsBlocked', true);
        }
        FFFTableSortFunctions.BU_NUMREQUESTSBLOCKED_DESC = BU_NUMREQUESTSBLOCKED_DESC;
        function BU_NUMFUSHLT_ASC(snapshot) {
            return BU_SORT(snapshot, 'numFUsHLT', false);
        }
        FFFTableSortFunctions.BU_NUMFUSHLT_ASC = BU_NUMFUSHLT_ASC;
        function BU_NUMFUSHLT_DESC(snapshot) {
            return BU_SORT(snapshot, 'numFUsHLT', true);
        }
        FFFTableSortFunctions.BU_NUMFUSHLT_DESC = BU_NUMFUSHLT_DESC;
        function BU_NUMFUSCRASHED_ASC(snapshot) {
            return BU_SORT(snapshot, 'numFUsCrashed', false);
        }
        FFFTableSortFunctions.BU_NUMFUSCRASHED_ASC = BU_NUMFUSCRASHED_ASC;
        function BU_NUMFUSCRASHED_DESC(snapshot) {
            return BU_SORT(snapshot, 'numFUsCrashed', true);
        }
        FFFTableSortFunctions.BU_NUMFUSCRASHED_DESC = BU_NUMFUSCRASHED_DESC;
        function BU_NUMFUSSTALE_ASC(snapshot) {
            return BU_SORT(snapshot, 'numFUsStale', false);
        }
        FFFTableSortFunctions.BU_NUMFUSSTALE_ASC = BU_NUMFUSSTALE_ASC;
        function BU_NUMFUSSTALE_DESC(snapshot) {
            return BU_SORT(snapshot, 'numFUsStale', true);
        }
        FFFTableSortFunctions.BU_NUMFUSSTALE_DESC = BU_NUMFUSSTALE_DESC;
        function BU_NUMFUSCLOUD_ASC(snapshot) {
            return BU_SORT(snapshot, 'numFUsCloud', false);
        }
        FFFTableSortFunctions.BU_NUMFUSCLOUD_ASC = BU_NUMFUSCLOUD_ASC;
        function BU_NUMFUSCLOUD_DESC(snapshot) {
            return BU_SORT(snapshot, 'numFUsCloud', true);
        }
        FFFTableSortFunctions.BU_NUMFUSCLOUD_DESC = BU_NUMFUSCLOUD_DESC;
        function BU_RAMDISKUSAGE_ASC(snapshot) {
            return BU_SORT(snapshot, 'ramDiskUsage', false);
        }
        FFFTableSortFunctions.BU_RAMDISKUSAGE_ASC = BU_RAMDISKUSAGE_ASC;
        function BU_RAMDISKUSAGE_DESC(snapshot) {
            return BU_SORT(snapshot, 'ramDiskUsage', true);
        }
        FFFTableSortFunctions.BU_RAMDISKUSAGE_DESC = BU_RAMDISKUSAGE_DESC;
        function BU_NUMFILES_ASC(snapshot) {
            return BU_SORT(snapshot, 'numFiles', false);
        }
        FFFTableSortFunctions.BU_NUMFILES_ASC = BU_NUMFILES_ASC;
        function BU_NUMFILES_DESC(snapshot) {
            return BU_SORT(snapshot, 'numFiles', true);
        }
        FFFTableSortFunctions.BU_NUMFILES_DESC = BU_NUMFILES_DESC;
        function BU_CURRENTLUMISECTION_ASC(snapshot) {
            return BU_SORT(snapshot, 'currentLumisection', false);
        }
        FFFTableSortFunctions.BU_CURRENTLUMISECTION_ASC = BU_CURRENTLUMISECTION_ASC;
        function BU_CURRENTLUMISECTION_DESC(snapshot) {
            return BU_SORT(snapshot, 'currentLumisection', true);
        }
        FFFTableSortFunctions.BU_CURRENTLUMISECTION_DESC = BU_CURRENTLUMISECTION_DESC;
        function BU_FUOUTPUTBANDWIDTHINMB_ASC(snapshot) {
            return BU_SORT(snapshot, 'fuOutputBandwidthInMB', false);
        }
        FFFTableSortFunctions.BU_FUOUTPUTBANDWIDTHINMB_ASC = BU_FUOUTPUTBANDWIDTHINMB_ASC;
        function BU_FUOUTPUTBANDWIDTHINMB_DESC(snapshot) {
            return BU_SORT(snapshot, 'fuOutputBandwidthInMB', true);
        }
        FFFTableSortFunctions.BU_FUOUTPUTBANDWIDTHINMB_DESC = BU_FUOUTPUTBANDWIDTHINMB_DESC;
        function BU_NUMLUMISECTIONSWITHFILES_ASC(snapshot) {
            return BU_SORT(snapshot, 'numLumisectionsWithFiles', false);
        }
        FFFTableSortFunctions.BU_NUMLUMISECTIONSWITHFILES_ASC = BU_NUMLUMISECTIONSWITHFILES_ASC;
        function BU_NUMLUMISECTIONSWITHFILES_DESC(snapshot) {
            return BU_SORT(snapshot, 'numLumisectionsWithFiles', true);
        }
        FFFTableSortFunctions.BU_NUMLUMISECTIONSWITHFILES_DESC = BU_NUMLUMISECTIONSWITHFILES_DESC;
        function BU_NUMLUMISECTIONSFORHLT_ASC(snapshot) {
            return BU_SORT(snapshot, 'numLumisectionsForHLT', false);
        }
        FFFTableSortFunctions.BU_NUMLUMISECTIONSFORHLT_ASC = BU_NUMLUMISECTIONSFORHLT_ASC;
        function BU_NUMLUMISECTIONSFORHLT_DESC(snapshot) {
            return BU_SORT(snapshot, 'numLumisectionsForHLT', true);
        }
        FFFTableSortFunctions.BU_NUMLUMISECTIONSFORHLT_DESC = BU_NUMLUMISECTIONSFORHLT_DESC;
        function BU_NUMLUMISECTIONSOUTHLT_ASC(snapshot) {
            return BU_SORT(snapshot, 'numLumisectionsOutHLT', false);
        }
        FFFTableSortFunctions.BU_NUMLUMISECTIONSOUTHLT_ASC = BU_NUMLUMISECTIONSOUTHLT_ASC;
        function BU_NUMLUMISECTIONSOUTHLT_DESC(snapshot) {
            return BU_SORT(snapshot, 'numLumisectionsOutHLT', true);
        }
        FFFTableSortFunctions.BU_NUMLUMISECTIONSOUTHLT_DESC = BU_NUMLUMISECTIONSOUTHLT_DESC;
    })(FFFTableSortFunctions = DAQView.FFFTableSortFunctions || (DAQView.FFFTableSortFunctions = {}));
    var FFFTableNumberFormats;
    (function (FFFTableNumberFormats) {
        FFFTableNumberFormats.RATE = {
            baseStyle: 'fff-table-rate',
            formats: [{ min: 0, max: 0, styleSuffix: '-zero' }, { styleSuffix: '-nonzero' }]
        };
        FFFTableNumberFormats.THROUGHPUT = {
            baseStyle: 'fff-table-throughput',
            formats: [{ min: 0, max: 0, styleSuffix: '-zero' }, { styleSuffix: '-nonzero' }]
        };
        FFFTableNumberFormats.SIZE = {
            baseStyle: 'fff-table-size',
            formats: [{ min: 0, max: 0, styleSuffix: '-zero' }, { styleSuffix: '-nonzero' }]
        };
        FFFTableNumberFormats.EVENTS = {
            baseStyle: 'fff-table-events'
        };
        FFFTableNumberFormats.EVENTS_IN_BU = {
            baseStyle: 'fff-table-events-in-bu'
        };
        FFFTableNumberFormats.REQUESTS_SENT = {
            baseStyle: 'fff-table-requests-sent'
        };
        FFFTableNumberFormats.REQUESTS_USED = {
            baseStyle: 'fff-table-requests-used'
        };
        FFFTableNumberFormats.REQUESTS_BLOCKED = {
            baseStyle: 'fff-table-requests-blocked'
        };
    })(FFFTableNumberFormats = DAQView.FFFTableNumberFormats || (DAQView.FFFTableNumberFormats = {}));
    var FileBasedFilterFarmTableElement = (function (_super) {
        __extends(FileBasedFilterFarmTableElement, _super);
        function FileBasedFilterFarmTableElement() {
            _super.apply(this, arguments);
        }
        FileBasedFilterFarmTableElement.prototype.render = function () {
            var tableObject = this.props.tableObject;
            var baseHeaders = [
                {
                    content: 'rate (kHz)',
                    tableObject: tableObject,
                    sortFunctions: {
                        Ascending: FFFTableSortFunctions.BU_RATE_ASC,
                        Descending: FFFTableSortFunctions.BU_RATE_DESC
                    }
                },
                {
                    content: 'thru (MB/s)',
                    tableObject: tableObject,
                    sortFunctions: {
                        Ascending: FFFTableSortFunctions.BU_THROUGHPUT_ASC,
                        Descending: FFFTableSortFunctions.BU_THROUGHPUT_DESC
                    }
                },
                {
                    content: 'size (kB)',
                    tableObject: tableObject,
                    sortFunctions: {
                        Ascending: FFFTableSortFunctions.BU_EVENTSIZEMEAN_ASC,
                        Descending: FFFTableSortFunctions.BU_EVENTSIZEMEAN_DESC
                    }
                },
                {
                    content: '#events',
                    tableObject: tableObject,
                    sortFunctions: {
                        Ascending: FFFTableSortFunctions.BU_NUMEVENTS_ASC,
                        Descending: FFFTableSortFunctions.BU_NUMEVENTS_DESC
                    }
                },
                {
                    content: '#evts in BU',
                    tableObject: tableObject,
                    sortFunctions: {
                        Ascending: FFFTableSortFunctions.BU_NUMEVENTSINBU_ASC,
                        Descending: FFFTableSortFunctions.BU_NUMEVENTSINBU_DESC
                    }
                },
                {
                    content: 'priority',
                    tableObject: tableObject,
                    sortFunctions: {
                        Ascending: FFFTableSortFunctions.BU_PRIORITY_ASC,
                        Descending: FFFTableSortFunctions.BU_PRIORITY_DESC
                    }
                },
                {
                    content: '#req. sent',
                    tableObject: tableObject,
                    sortFunctions: {
                        Ascending: FFFTableSortFunctions.BU_NUMREQUESTSSENT_ASC,
                        Descending: FFFTableSortFunctions.BU_NUMREQUESTSSENT_DESC
                    }
                },
                {
                    content: '#req. used',
                    tableObject: tableObject,
                    sortFunctions: {
                        Ascending: FFFTableSortFunctions.BU_NUMREQUESTSUSED_ASC,
                        Descending: FFFTableSortFunctions.BU_NUMREQUESTSUSED_DESC
                    }
                },
                {
                    content: '#req. blocked',
                    tableObject: tableObject,
                    sortFunctions: {
                        Ascending: FFFTableSortFunctions.BU_NUMREQUESTSBLOCKED_ASC,
                        Descending: FFFTableSortFunctions.BU_NUMREQUESTSBLOCKED_DESC
                    }
                },
                {
                    content: '#FUs HLT',
                    tableObject: tableObject,
                    sortFunctions: {
                        Ascending: FFFTableSortFunctions.BU_NUMFUSHLT_ASC,
                        Descending: FFFTableSortFunctions.BU_NUMFUSHLT_DESC
                    }
                },
                {
                    content: '#FUs crash',
                    tableObject: tableObject,
                    sortFunctions: {
                        Ascending: FFFTableSortFunctions.BU_NUMFUSCRASHED_ASC,
                        Descending: FFFTableSortFunctions.BU_NUMFUSCRASHED_DESC
                    }
                },
                {
                    content: '#FUs stale',
                    tableObject: tableObject,
                    sortFunctions: {
                        Ascending: FFFTableSortFunctions.BU_NUMFUSSTALE_ASC,
                        Descending: FFFTableSortFunctions.BU_NUMFUSSTALE_DESC
                    }
                },
                {
                    content: '#FUs cloud',
                    tableObject: tableObject,
                    sortFunctions: {
                        Ascending: FFFTableSortFunctions.BU_NUMFUSCLOUD_ASC,
                        Descending: FFFTableSortFunctions.BU_NUMFUSCLOUD_DESC
                    }
                },
                {
                    content: 'RAM disk usage',
                    tableObject: tableObject,
                    sortFunctions: {
                        Ascending: FFFTableSortFunctions.BU_RAMDISKUSAGE_ASC,
                        Descending: FFFTableSortFunctions.BU_RAMDISKUSAGE_DESC
                    }
                },
                {
                    content: '#files',
                    tableObject: tableObject,
                    sortFunctions: {
                        Ascending: FFFTableSortFunctions.BU_NUMFILES_ASC,
                        Descending: FFFTableSortFunctions.BU_NUMFILES_DESC
                    }
                },
                {
                    content: '#LS w/ files',
                    tableObject: tableObject,
                    sortFunctions: {
                        Ascending: FFFTableSortFunctions.BU_NUMLUMISECTIONSWITHFILES_ASC,
                        Descending: FFFTableSortFunctions.BU_NUMLUMISECTIONSWITHFILES_DESC
                    }
                },
                {
                    content: 'current LS',
                    tableObject: tableObject,
                    sortFunctions: {
                        Ascending: FFFTableSortFunctions.BU_CURRENTLUMISECTION_ASC,
                        Descending: FFFTableSortFunctions.BU_CURRENTLUMISECTION_DESC
                    }
                },
                {
                    content: '#LS for HLT',
                    tableObject: tableObject,
                    sortFunctions: {
                        Ascending: FFFTableSortFunctions.BU_NUMLUMISECTIONSFORHLT_ASC,
                        Descending: FFFTableSortFunctions.BU_NUMLUMISECTIONSFORHLT_DESC
                    }
                },
                {
                    content: '#LS out HLT',
                    tableObject: tableObject,
                    sortFunctions: {
                        Ascending: FFFTableSortFunctions.BU_NUMLUMISECTIONSOUTHLT_ASC,
                        Descending: FFFTableSortFunctions.BU_NUMLUMISECTIONSOUTHLT_DESC
                    }
                },
                {
                    content: 'b/w out (MB/s)',
                    tableObject: tableObject,
                    sortFunctions: {
                        Ascending: FFFTableSortFunctions.BU_FUOUTPUTBANDWIDTHINMB_ASC,
                        Descending: FFFTableSortFunctions.BU_FUOUTPUTBANDWIDTHINMB_DESC
                    }
                }
            ];
            var topHeaders = baseHeaders.slice();
            topHeaders.unshift({
                content: 'BU',
                tableObject: tableObject,
                sortFunctions: {
                    Ascending: FFFTableSortFunctions.BU_HOSTNAME_ASC,
                    Descending: FFFTableSortFunctions.BU_HOSTNAME_DESC
                }
            });
            var summaryHeaders = baseHeaders.slice();
            summaryHeaders.unshift({ content: 'Summary' });
            var buSummary = this.props.buSummary;
            var bus = this.props.bus;
            var numBus = 0;
            var buRows = [];
            if (bus) {
                numBus = bus.length;
                bus.forEach(function (bu) { return buRows.push(React.createElement(FileBasedFilterFarmTableBURow, {bu: bu})); });
            }
            return (React.createElement("table", {className: "fff-table"}, React.createElement("thead", {className: "fff-table-head"}, React.createElement(FileBasedFilterFarmTableTopHeaderRow, null), React.createElement(FileBasedFilterFarmTableHeaderRow, {headers: topHeaders})), React.createElement("tbody", {className: "fff-table-body"}, buRows, React.createElement(FileBasedFilterFarmTableHeaderRow, {headers: summaryHeaders}), React.createElement(FileBasedFilterFarmTableBUSummaryRow, {buSummary: buSummary, numBus: numBus}))));
        };
        return FileBasedFilterFarmTableElement;
    }(React.Component));
    var FileBasedFilterFarmTableTopHeaderRow = (function (_super) {
        __extends(FileBasedFilterFarmTableTopHeaderRow, _super);
        function FileBasedFilterFarmTableTopHeaderRow() {
            _super.apply(this, arguments);
        }
        FileBasedFilterFarmTableTopHeaderRow.prototype.render = function () {
            return (React.createElement("tr", {className: "fff-table-top-header-row"}, React.createElement(FileBasedFilterFarmTableHeader, {additionalClasses: "fff-table-help", content: React.createElement("a", {href: "."}, "Table Help"), colSpan: "2"}), React.createElement(FileBasedFilterFarmTableHeader, {content: "B U I L D E R   U N I T   ( B U )", colSpan: "19"})));
        };
        return FileBasedFilterFarmTableTopHeaderRow;
    }(React.Component));
    var FileBasedFilterFarmTableHeaderRow = (function (_super) {
        __extends(FileBasedFilterFarmTableHeaderRow, _super);
        function FileBasedFilterFarmTableHeaderRow() {
            _super.apply(this, arguments);
        }
        FileBasedFilterFarmTableHeaderRow.prototype.render = function () {
            var children = [];
            this.props.headers.forEach(function (header) { return children.push(React.createElement(FileBasedFilterFarmTableHeader, {content: header.content, colSpan: header.colSpan, additionalClasses: header.additionalClasses, tableObject: header.tableObject, sortFunctions: header.sortFunctions})); });
            return (React.createElement("tr", {className: "fff-table-header-row"}, children));
        };
        return FileBasedFilterFarmTableHeaderRow;
    }(React.Component));
    var FileBasedFilterFarmTableHeader = (function (_super) {
        __extends(FileBasedFilterFarmTableHeader, _super);
        function FileBasedFilterFarmTableHeader() {
            _super.apply(this, arguments);
        }
        FileBasedFilterFarmTableHeader.prototype.render = function () {
            var content = this.props.content;
            var colSpan = this.props.colSpan;
            var additionalClasses = this.props.additionalClasses;
            var className = classNames("fff-table-header", additionalClasses);
            var tableObject = this.props.tableObject;
            var currentSorting;
            var sortFunctions = this.props.sortFunctions;
            if (tableObject && sortFunctions) {
                currentSorting = tableObject.getCurrentSorting(content);
            }
            var clickFunction = null;
            if (tableObject && sortFunctions) {
                if (currentSorting === DAQView.Sorting.None || currentSorting === DAQView.Sorting.Descending) {
                    clickFunction = function () {
                        tableObject.setSortFunction.bind(tableObject)(sortFunctions[DAQView.Sorting.Ascending.toString()]);
                        tableObject.setCurrentSorting.bind(tableObject)(content, DAQView.Sorting.Ascending);
                    };
                }
                else if (currentSorting === DAQView.Sorting.Ascending) {
                    clickFunction = function () {
                        tableObject.setSortFunction.bind(tableObject)(sortFunctions[DAQView.Sorting.Descending.toString()]);
                        tableObject.setCurrentSorting.bind(tableObject)(content, DAQView.Sorting.Descending);
                    };
                }
            }
            var sortingImage = null;
            if (currentSorting) {
                sortingImage = React.createElement("input", {type: "image", className: "fff-table-sort-image", src: 'dist/img/' + currentSorting.getImagePath(), alt: currentSorting.toString(), title: "Sort", onClick: clickFunction});
            }
            return (React.createElement("th", {className: className, colSpan: colSpan ? colSpan : "1"}, content, sortingImage));
        };
        return FileBasedFilterFarmTableHeader;
    }(React.Component));
    var FileBasedFilterFarmTableBURow = (function (_super) {
        __extends(FileBasedFilterFarmTableBURow, _super);
        function FileBasedFilterFarmTableBURow() {
            _super.apply(this, arguments);
        }
        FileBasedFilterFarmTableBURow.prototype.render = function () {
            var bu = this.props.bu;
            var buUrl = 'http://' + bu.hostname + ':11100/urn:xdaq-application:service=bu';
            var hostname = bu.hostname.substring(0, bu.hostname.length - 4);
            var rate = FormatUtility.toFixedNumber(bu.rate / 1000, 3);
            var throughput = FormatUtility.toFixedNumber(bu.throughput / 1024 / 1024, 1);
            var sizeMean = FormatUtility.toFixedNumber(bu.eventSizeMean / 1024, 1);
            var sizeStddev = FormatUtility.toFixedNumber(bu.eventSizeStddev / 1024, 1);
            var events = bu.numEvents;
            var eventsInBU = bu.numEventsInBU;
            var requestsSent = bu.numRequestsSent;
            var requestsUsed = bu.numRequestsUsed;
            var requestsBlocked = bu.numRequestsBlocked;
            bu.fuOutputBandwidthInMB = 0;
            return (React.createElement("tr", {className: "fff-table-bu-row"}, React.createElement("td", null, React.createElement("a", {href: buUrl, target: "_blank"}, hostname)), React.createElement("td", {className: FormatUtility.getClassNameForNumber(rate, FFFTableNumberFormats.RATE)}, rate), React.createElement("td", {className: FormatUtility.getClassNameForNumber(throughput, FFFTableNumberFormats.THROUGHPUT)}, throughput), React.createElement("td", {className: FormatUtility.getClassNameForNumber(sizeMean, FFFTableNumberFormats.SIZE)}, sizeMean, "±", sizeStddev), React.createElement("td", {className: FormatUtility.getClassNameForNumber(events, FFFTableNumberFormats.EVENTS)}, events), React.createElement("td", {className: FormatUtility.getClassNameForNumber(eventsInBU, FFFTableNumberFormats.EVENTS_IN_BU)}, eventsInBU), React.createElement("td", null, bu.priority), React.createElement("td", {className: FormatUtility.getClassNameForNumber(requestsSent, FFFTableNumberFormats.REQUESTS_SENT)}, requestsSent), React.createElement("td", {className: FormatUtility.getClassNameForNumber(requestsUsed, FFFTableNumberFormats.REQUESTS_USED)}, requestsUsed), React.createElement("td", {className: FormatUtility.getClassNameForNumber(requestsBlocked, FFFTableNumberFormats.REQUESTS_BLOCKED)}, requestsBlocked), React.createElement("td", null, bu.numFUsHLT), React.createElement("td", null, bu.numFUsCrashed), React.createElement("td", null, bu.numFUsStale), React.createElement("td", null, bu.numFUsCloud), React.createElement("td", null, bu.ramDiskUsage.toFixed(1), "% of ", bu.ramDiskTotal.toFixed(1), "GB"), React.createElement("td", null, bu.numFiles), React.createElement("td", null, bu.numLumisectionsWithFiles), React.createElement("td", null, bu.currentLumisection), React.createElement("td", null, bu.numLumisectionsForHLT), React.createElement("td", null, bu.numLumisectionsOutHLT), React.createElement("td", null, bu.fuOutputBandwidthInMB.toFixed(1))));
        };
        return FileBasedFilterFarmTableBURow;
    }(React.Component));
    var FileBasedFilterFarmTableBUSummaryRow = (function (_super) {
        __extends(FileBasedFilterFarmTableBUSummaryRow, _super);
        function FileBasedFilterFarmTableBUSummaryRow() {
            _super.apply(this, arguments);
        }
        FileBasedFilterFarmTableBUSummaryRow.prototype.render = function () {
            var buSummary = this.props.buSummary;
            buSummary.fuOutputBandwidthInMB = 0;
            return (React.createElement("tr", {className: "fff-table-bu-summary-row"}, React.createElement("td", null, "Σ BUs = x / ", this.props.numBus), React.createElement("td", null, "Σ ", (buSummary.rate / 1000).toFixed(3)), React.createElement("td", null, "Σ ", (buSummary.throughput / 1024 / 1024).toFixed(1)), React.createElement("td", null, (buSummary.eventSizeMean / 1024).toFixed(1), "±", (buSummary.eventSizeStddev / 1024).toFixed(1)), React.createElement("td", null, "Σ ", buSummary.numEvents), React.createElement("td", null, "Σ ", buSummary.numEventsInBU), React.createElement("td", null, buSummary.priority), React.createElement("td", null, "Σ ", buSummary.numRequestsSent), React.createElement("td", null, "Σ ", buSummary.numRequestsUsed), React.createElement("td", null, "Σ ", buSummary.numRequestsBlocked), React.createElement("td", null, "Σ ", buSummary.numFUsHLT), React.createElement("td", null, "Σ ", buSummary.numFUsCrashed), React.createElement("td", null, "Σ ", buSummary.numFUsStale), React.createElement("td", null, "Σ ", buSummary.numFUsCloud), React.createElement("td", null, "Σ ", buSummary.ramDiskUsage.toFixed(1), "% of ", buSummary.ramDiskTotal.toFixed(1), "GB"), React.createElement("td", null, "Σ ", buSummary.numFiles), React.createElement("td", null, buSummary.numLumisectionsWithFiles), React.createElement("td", null, buSummary.currentLumisection), React.createElement("td", null, buSummary.numLumisectionsForHLT), React.createElement("td", null, buSummary.numLumisectionsOutHLT), React.createElement("td", null, buSummary.fuOutputBandwidthInMB.toFixed(1))));
        };
        return FileBasedFilterFarmTableBUSummaryRow;
    }(React.Component));
})(DAQView || (DAQView = {}));
//# sourceMappingURL=fff-table.js.map