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
                'BU': Sorting.None,
                'rate (kHz)': Sorting.None,
                'thru (MB/s)': Sorting.None,
                'size (kB)': Sorting.None,
                '#events': Sorting.None,
                '#evts in BU': Sorting.None,
                'priority': Sorting.None,
                '#req. sent': Sorting.None,
                '#req. used': Sorting.None,
                '#req. blocked': Sorting.None,
                '#FUs HLT': Sorting.None,
                '#FUs crash': Sorting.None,
                '#FUs stale': Sorting.None,
                '#FUs cloud': Sorting.None,
                'RAM disk usage': Sorting.None,
                '#files': Sorting.None,
                'b/w out (MB/s)': Sorting.None
            };
            this.htmlRootElement = document.getElementById(htmlRootElementName);
        }
        FileBasedFilterFarmTable.prototype.setSnapshot = function (snapshot) {
            this.snapshot = snapshot;
            var sortedSnapshot = this.sort(snapshot);
            var daq = sortedSnapshot.getDAQ();
            var fileBasedFilterFarmTableRootElement = React.createElement(FileBasedFilterFarmTableElement, {
                tableObject: this,
                bus: daq.bus,
                buSummary: daq.buSummary
            });
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
            DAQViewUtility.forEachOwnObjectProperty(this.currentSorting, function (header) { return _this.currentSorting[header] = Sorting.None; });
            this.currentSorting[headerName] = sorting;
        };
        FileBasedFilterFarmTable.prototype.getCurrentSorting = function (headerName) {
            return this.currentSorting[headerName];
        };
        return FileBasedFilterFarmTable;
    }());
    DAQView.FileBasedFilterFarmTable = FileBasedFilterFarmTable;
    var Sorting = (function () {
        function Sorting(value, imagePath) {
            this.value = value;
            this.imagePath = imagePath;
        }
        Sorting.prototype.toString = function () {
            return this.value;
        };
        Sorting.prototype.getImagePath = function () {
            return this.imagePath;
        };
        Sorting.None = new Sorting('None', 'unsorted.png');
        Sorting.Ascending = new Sorting('Ascending', 'sort_asc.png');
        Sorting.Descending = new Sorting('Descending', 'sort_desc.png');
        return Sorting;
    }());
    var FFFTableSortFunctions;
    (function (FFFTableSortFunctions) {
        function NONE(snapshot) {
            return snapshot;
        }
        FFFTableSortFunctions.NONE = NONE;
        function BU_HOSTNAME(snapshot, descending) {
            var daq = snapshot.getDAQ();
            var bus = daq.bus.slice();
            bus.sort(function (firstBU, secondBU) {
                var firstBUHostname = firstBU.hostname;
                var secondBUHostname = secondBU.hostname;
                if (firstBUHostname > secondBUHostname) {
                    return (descending ? -1 : 1);
                }
                else if (firstBUHostname < secondBUHostname) {
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
            return BU_HOSTNAME(snapshot, false);
        }
        FFFTableSortFunctions.BU_HOSTNAME_ASC = BU_HOSTNAME_ASC;
        function BU_HOSTNAME_DESC(snapshot) {
            return BU_HOSTNAME(snapshot, true);
        }
        FFFTableSortFunctions.BU_HOSTNAME_DESC = BU_HOSTNAME_DESC;
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
                { content: 'rate (kHz)' },
                { content: 'thru (MB/s)' },
                { content: 'size (kB)' },
                { content: '#events' },
                { content: '#evts in BU' },
                { content: 'priority' },
                { content: '#req. sent' },
                { content: '#req. used' },
                { content: '#req. blocked' },
                { content: '#FUs HLT' },
                { content: '#FUs crash' },
                { content: '#FUs stale' },
                { content: '#FUs cloud' },
                { content: 'RAM disk usage' },
                { content: '#files' },
                { content: '#LS w/ files' },
                { content: 'current LS' },
                { content: '#LS for HLT' },
                { content: '#LS out HLT' },
                { content: 'b/w out (MB/s)' }
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
            return (React.createElement("table", {className: "fff-table"}, React.createElement("thead", {className: "fb-table-head"}, React.createElement(FileBasedFilterFarmTableTopHeaderRow, null), React.createElement(FileBasedFilterFarmTableHeaderRow, {headers: topHeaders})), React.createElement("tbody", {className: "fb-table-body"}, buRows, React.createElement(FileBasedFilterFarmTableHeaderRow, {headers: summaryHeaders}), React.createElement(FileBasedFilterFarmTableBUSummaryRow, {buSummary: buSummary, numBus: numBus}))));
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
                if (currentSorting === Sorting.None || currentSorting === Sorting.Descending) {
                    clickFunction = function () {
                        tableObject.setSortFunction.bind(tableObject)(sortFunctions[Sorting.Ascending.toString()]);
                        tableObject.setCurrentSorting.bind(tableObject)(content, Sorting.Ascending);
                    };
                }
                else if (currentSorting === Sorting.Ascending) {
                    clickFunction = function () {
                        tableObject.setSortFunction.bind(tableObject)(sortFunctions[Sorting.Descending.toString()]);
                        tableObject.setCurrentSorting.bind(tableObject)(content, Sorting.Descending);
                    };
                }
            }
            var sortingImage = null;
            if (currentSorting) {
                sortingImage = React.createElement("input", {type: "image", className: "fff-table-sort-image", src: 'dist/img/' + currentSorting.getImagePath(), alt: currentSorting.toString(), title: "Sort", onClick: clickFunction});
            }
            return (React.createElement("th", {className: className, colSpan: colSpan ? colSpan : "1"}, content, " ", sortingImage));
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
            var buUrl = bu.hostname + ':11100/urn:xdaq-application:service=bu';
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
            return (React.createElement("tr", {className: "fff-table-bu-row"}, React.createElement("td", null, React.createElement("a", {href: buUrl, target: "_blank"}, hostname)), React.createElement("td", {className: FormatUtility.getClassNameForNumber(rate, FFFTableNumberFormats.RATE)}, rate), React.createElement("td", {className: FormatUtility.getClassNameForNumber(throughput, FFFTableNumberFormats.THROUGHPUT)}, throughput), React.createElement("td", {className: FormatUtility.getClassNameForNumber(sizeMean, FFFTableNumberFormats.SIZE)}, sizeMean, "±", sizeStddev), React.createElement("td", {className: FormatUtility.getClassNameForNumber(events, FFFTableNumberFormats.EVENTS)}, events), React.createElement("td", {className: FormatUtility.getClassNameForNumber(eventsInBU, FFFTableNumberFormats.EVENTS_IN_BU)}, eventsInBU), React.createElement("td", null, bu.priority), React.createElement("td", {className: FormatUtility.getClassNameForNumber(requestsSent, FFFTableNumberFormats.REQUESTS_SENT)}, requestsSent), React.createElement("td", {className: FormatUtility.getClassNameForNumber(requestsUsed, FFFTableNumberFormats.REQUESTS_USED)}, requestsUsed), React.createElement("td", {className: FormatUtility.getClassNameForNumber(requestsBlocked, FFFTableNumberFormats.REQUESTS_BLOCKED)}, requestsBlocked), React.createElement("td", null, bu.numFUsHlt), React.createElement("td", null, bu.numFUsCrashed), React.createElement("td", null, bu.numFUsStale), React.createElement("td", null, bu.numFUsCloud), React.createElement("td", null, bu.ramDiskUsage.toFixed(1), "% of ", bu.ramDiskTotal.toFixed(1), "GB"), React.createElement("td", null, bu.numFiles), React.createElement("td", null, bu.numLumisectionsWithFiles), React.createElement("td", null, bu.currentLumisection), React.createElement("td", null, bu.numLumisectionsForHLT), React.createElement("td", null, bu.numLumisectionsOutHLT), React.createElement("td", null, bu.fuOutputBandwidthInMB.toFixed(1))));
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
            return (React.createElement("tr", {className: "fff-table-bu-summary-row"}, React.createElement("td", null, "Σ BUs = x / ", this.props.numBus), React.createElement("td", null, "Σ ", (buSummary.rate / 1000).toFixed(3)), React.createElement("td", null, "Σ ", (buSummary.throughput / 1024 / 1024).toFixed(1)), React.createElement("td", null, (buSummary.eventSizeMean / 1024).toFixed(1), "±", (buSummary.eventSizeStddev / 1024).toFixed(1)), React.createElement("td", null, "Σ ", buSummary.numEvents), React.createElement("td", null, "Σ ", buSummary.numEventsInBU), React.createElement("td", null, buSummary.priority), React.createElement("td", null, "Σ ", buSummary.numRequestsSent), React.createElement("td", null, "Σ ", buSummary.numRequestsUsed), React.createElement("td", null, "Σ ", buSummary.numRequestsBlocked), React.createElement("td", null, "Σ ", buSummary.numFUsHlt), React.createElement("td", null, "Σ ", buSummary.numFUsCrashed), React.createElement("td", null, "Σ ", buSummary.numFUsStale), React.createElement("td", null, "Σ ", buSummary.numFUsCloud), React.createElement("td", null, "Σ ", buSummary.ramDiskUsage.toFixed(1), "% of ", buSummary.ramDiskTotal.toFixed(1), "GB"), React.createElement("td", null, "Σ ", buSummary.numFiles), React.createElement("td", null, buSummary.numLumisectionsWithFiles), React.createElement("td", null, buSummary.currentLumisection), React.createElement("td", null, buSummary.numLumisectionsForHLT), React.createElement("td", null, buSummary.numLumisectionsOutHLT), React.createElement("td", null, buSummary.fuOutputBandwidthInMB.toFixed(1))));
        };
        return FileBasedFilterFarmTableBUSummaryRow;
    }(React.Component));
})(DAQView || (DAQView = {}));
//# sourceMappingURL=fff-table.js.map