"use strict";
/**
 * @author Michail Vougioukas
 * @author Philipp Brummer
 */
var DAQView;
(function (DAQView) {
    class FileBasedFilterFarmTable {
        constructor(htmlRootElementName) {
            this.DEFAULT_PRESORT_FUNCTION = FFFTableSortFunctions.BU_HOSTNAME_ASC;
            this.INITIAL_SORT_FUNCTION = FFFTableSortFunctions.BU_HOSTNAME_ASC;
            this.INITIAL_PRESORT_FUNCTION = FFFTableSortFunctions.NONE;
            this.snapshot = null;
            this.drawPausedComponent = false;
            this.drawZeroDataFlowComponent = false;
            this.drawStaleSnapshot = false;
            this.sortFunction = {
                presort: this.INITIAL_PRESORT_FUNCTION,
                sort: this.INITIAL_SORT_FUNCTION
            };
            this.currentSorting = {
                'BU': DAQView.Sorting.Ascending,
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
        setSnapshot(snapshot, drawPausedComponent, drawZeroDataFlowComponent, drawStaleSnapshot, url) {
            if (!snapshot) {
                let msg = "";
                let errRootElement = React.createElement(ErrorElement, { message: msg });
                ReactDOM.render(errRootElement, this.htmlRootElement);
            }
            else {
                if (this.snapshot != null && this.snapshot.getUpdateTimestamp() === snapshot.getUpdateTimestamp()) {
                    console.log("duplicate snapshot detected");
                    if (drawPausedComponent || drawZeroDataFlowComponent || drawStaleSnapshot) {
                        console.log("...but page color has to change, so do render");
                    }
                    else {
                        return;
                    }
                }
                this.snapshot = snapshot;
                this.drawPausedComponent = drawPausedComponent;
                this.drawZeroDataFlowComponent = drawZeroDataFlowComponent;
                this.drawStaleSnapshot = drawStaleSnapshot;
                this.updateSnapshot();
            }
        }
        //to be called before setSnapshot
        prePassElementSpecificData(args) {
        }
        updateSnapshot() {
            let sortedSnapshot = this.sort(this.snapshot);
            let daq = sortedSnapshot.getDAQ();
            let drawPausedComponent = this.drawPausedComponent;
            let drawZeroDataFlowComponent = this.drawZeroDataFlowComponent;
            let drawStaleSnapshot = this.drawStaleSnapshot;
            let fileBasedFilterFarmTableRootElement = React.createElement(FileBasedFilterFarmTableElement, { tableObject: this, bus: daq.bus, buSummary: daq.buSummary, drawPausedComponent: drawPausedComponent, drawZeroDataFlowComponent: drawZeroDataFlowComponent, drawStaleSnapshot: drawStaleSnapshot });
            ReactDOM.render(fileBasedFilterFarmTableRootElement, this.htmlRootElement);
        }
        setSortFunction(sortFunctions) {
            let presortFunction;
            let sortFunction;
            if (sortFunctions.hasOwnProperty('presort')) {
                presortFunction = sortFunctions.presort;
            }
            else {
                presortFunction = this.DEFAULT_PRESORT_FUNCTION;
            }
            sortFunction = sortFunctions.sort;
            this.sortFunction = { presort: presortFunction, sort: sortFunction };
            this.updateSnapshot();
        }
        sort(snapshot) {
            return this.sortFunction.sort(this.sortFunction.presort(snapshot));
        }
        setCurrentSorting(headerName, sorting) {
            DAQViewUtility.forEachOwnObjectProperty(this.currentSorting, (header) => this.currentSorting[header] = DAQView.Sorting.None);
            this.currentSorting[headerName] = sorting;
        }
        getCurrentSorting(headerName) {
            if (!this.currentSorting.hasOwnProperty(headerName)) {
                return null;
            }
            return this.currentSorting[headerName];
        }
    }
    DAQView.FileBasedFilterFarmTable = FileBasedFilterFarmTable;
    class ErrorElement extends React.Component {
        render() {
            return (React.createElement("div", null, this.props.message));
        }
    }
    let FFFTableSortFunctions;
    (function (FFFTableSortFunctions) {
        function NONE(snapshot) {
            return snapshot;
        }
        FFFTableSortFunctions.NONE = NONE;
        function BU_SORT(snapshot, attribute, descending) {
            let daq = snapshot.getDAQ();
            let bus = daq.bus;
            bus.sort(function (firstBU, secondBU) {
                let firstBUValue = firstBU[attribute];
                let secondBUValue = secondBU[attribute];
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
    let FFFTableNumberFormats;
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
            baseStyle: 'fff-table-requests-blocked',
            formats: [{ min: 1, max: 1000000, styleSuffix: '-nonzero' }]
        };
        FFFTableNumberFormats.PRIORITY = {
            baseStyle: 'fff-table-priority',
            formats: [{ min: 1, max: 1000000, styleSuffix: '-nonzero' }]
        };
        FFFTableNumberFormats.BANDWIDTH = {
            baseStyle: 'fff-table-bwout',
            formats: [{ min: 100, max: 1000000, styleSuffix: '-over' }, { styleSuffix: '' }]
        };
    })(FFFTableNumberFormats = DAQView.FFFTableNumberFormats || (DAQView.FFFTableNumberFormats = {}));
    const FFF_TABLE_BASE_HEADERS = [
        {
            content: ''
        },
        {
            content: 'rate (kHz)',
            sortFunctions: {
                Ascending: { sort: FFFTableSortFunctions.BU_RATE_ASC },
                Descending: { sort: FFFTableSortFunctions.BU_RATE_DESC }
            }
        },
        {
            content: 'thru (MB/s)',
            sortFunctions: {
                Ascending: { sort: FFFTableSortFunctions.BU_THROUGHPUT_ASC },
                Descending: { sort: FFFTableSortFunctions.BU_THROUGHPUT_DESC }
            }
        },
        {
            content: 'size (kB)',
            sortFunctions: {
                Ascending: { sort: FFFTableSortFunctions.BU_EVENTSIZEMEAN_ASC },
                Descending: { sort: FFFTableSortFunctions.BU_EVENTSIZEMEAN_DESC }
            }
        },
        {
            content: '#events',
            sortFunctions: {
                Ascending: { sort: FFFTableSortFunctions.BU_NUMEVENTS_ASC },
                Descending: { sort: FFFTableSortFunctions.BU_NUMEVENTS_DESC }
            }
        },
        {
            content: '#evts in BU',
            sortFunctions: {
                Ascending: { sort: FFFTableSortFunctions.BU_NUMEVENTSINBU_ASC },
                Descending: { sort: FFFTableSortFunctions.BU_NUMEVENTSINBU_DESC }
            }
        },
        {
            content: 'priority',
            sortFunctions: {
                Ascending: { sort: FFFTableSortFunctions.BU_PRIORITY_ASC },
                Descending: { sort: FFFTableSortFunctions.BU_PRIORITY_DESC }
            }
        },
        {
            content: '#req. sent',
            sortFunctions: {
                Ascending: { sort: FFFTableSortFunctions.BU_NUMREQUESTSSENT_ASC },
                Descending: { sort: FFFTableSortFunctions.BU_NUMREQUESTSSENT_DESC }
            }
        },
        {
            content: '#req. used',
            sortFunctions: {
                Ascending: { sort: FFFTableSortFunctions.BU_NUMREQUESTSUSED_ASC },
                Descending: { sort: FFFTableSortFunctions.BU_NUMREQUESTSUSED_DESC }
            }
        },
        {
            content: '#req. blocked',
            sortFunctions: {
                Ascending: { sort: FFFTableSortFunctions.BU_NUMREQUESTSBLOCKED_ASC },
                Descending: { sort: FFFTableSortFunctions.BU_NUMREQUESTSBLOCKED_DESC }
            }
        },
        {
            content: '#FUs HLT',
            sortFunctions: {
                Ascending: { sort: FFFTableSortFunctions.BU_NUMFUSHLT_ASC },
                Descending: { sort: FFFTableSortFunctions.BU_NUMFUSHLT_DESC }
            }
        },
        {
            content: '#FUs crash',
            sortFunctions: {
                Ascending: { sort: FFFTableSortFunctions.BU_NUMFUSCRASHED_ASC },
                Descending: { sort: FFFTableSortFunctions.BU_NUMFUSCRASHED_DESC }
            }
        },
        {
            content: '#FUs stale',
            sortFunctions: {
                Ascending: { sort: FFFTableSortFunctions.BU_NUMFUSSTALE_ASC },
                Descending: { sort: FFFTableSortFunctions.BU_NUMFUSSTALE_DESC }
            }
        },
        {
            content: '#FUs cloud',
            sortFunctions: {
                Ascending: { sort: FFFTableSortFunctions.BU_NUMFUSCLOUD_ASC },
                Descending: { sort: FFFTableSortFunctions.BU_NUMFUSCLOUD_DESC }
            }
        },
        {
            content: 'RAM disk usage',
            sortFunctions: {
                Ascending: { sort: FFFTableSortFunctions.BU_RAMDISKUSAGE_ASC },
                Descending: { sort: FFFTableSortFunctions.BU_RAMDISKUSAGE_DESC }
            }
        },
        {
            content: '#files',
            sortFunctions: {
                Ascending: { sort: FFFTableSortFunctions.BU_NUMFILES_ASC },
                Descending: { sort: FFFTableSortFunctions.BU_NUMFILES_DESC }
            }
        },
        {
            content: '#LS w/ files',
            sortFunctions: {
                Ascending: { sort: FFFTableSortFunctions.BU_NUMLUMISECTIONSWITHFILES_ASC },
                Descending: { sort: FFFTableSortFunctions.BU_NUMLUMISECTIONSWITHFILES_DESC }
            }
        },
        {
            content: 'current LS',
            sortFunctions: {
                Ascending: { sort: FFFTableSortFunctions.BU_CURRENTLUMISECTION_ASC },
                Descending: { sort: FFFTableSortFunctions.BU_CURRENTLUMISECTION_DESC }
            }
        },
        {
            content: '#LS for HLT',
            sortFunctions: {
                Ascending: { sort: FFFTableSortFunctions.BU_NUMLUMISECTIONSFORHLT_ASC },
                Descending: { sort: FFFTableSortFunctions.BU_NUMLUMISECTIONSFORHLT_DESC }
            }
        },
        {
            content: '#LS out HLT',
            sortFunctions: {
                Ascending: { sort: FFFTableSortFunctions.BU_NUMLUMISECTIONSOUTHLT_ASC },
                Descending: { sort: FFFTableSortFunctions.BU_NUMLUMISECTIONSOUTHLT_DESC }
            }
        },
        {
            content: 'b/w out (MB/s)',
            sortFunctions: {
                Ascending: { sort: FFFTableSortFunctions.BU_FUOUTPUTBANDWIDTHINMB_ASC },
                Descending: { sort: FFFTableSortFunctions.BU_FUOUTPUTBANDWIDTHINMB_DESC }
            }
        }
    ];
    const FFF_TABLE_TOP_HEADERS = FFF_TABLE_BASE_HEADERS.slice();
    FFF_TABLE_TOP_HEADERS.unshift({
        content: 'BU',
        sortFunctions: {
            Ascending: { presort: FFFTableSortFunctions.NONE, sort: FFFTableSortFunctions.BU_HOSTNAME_ASC },
            Descending: { presort: FFFTableSortFunctions.NONE, sort: FFFTableSortFunctions.BU_HOSTNAME_DESC }
        }
    }, {
        content: ''
    });
    const FFF_TABLE_SUMMARY_HEADERS = FFF_TABLE_BASE_HEADERS.slice();
    FFF_TABLE_SUMMARY_HEADERS.unshift({ content: 'Summary' });
    class FileBasedFilterFarmTableElement extends React.Component {
        render() {
            let buSummary = this.props.buSummary;
            let bus = this.props.bus;
            let numBus = 0;
            let drawPausedComponents = this.props.drawPausedComponent;
            let drawZeroDataFlowComponents = this.props.drawZeroDataFlowComponent;
            let drawStaleSnapshot = this.props.drawStaleSnapshot;
            let buRows = [];
            if (bus != null) {
                numBus = bus.length;
                bus.forEach(function (bu) {
                    let index = buRows.length;
                    let oddRow = (index % 2 == 1) ? true : false;
                    buRows.push(React.createElement(FileBasedFilterFarmTableBURow, { key: bu['@id'], bu: bu, drawPausedComponent: drawPausedComponents, drawZeroDataFlowComponent: drawZeroDataFlowComponents, oddRow: oddRow, drawStaleSnapshot: drawStaleSnapshot }));
                });
            }
            let numBusNoRate = numBus - buSummary.busNoRate;
            let tableObject = this.props.tableObject;
            return (React.createElement("table", { className: "fff-table" },
                React.createElement("thead", { className: "fff-table-head" },
                    React.createElement(FileBasedFilterFarmTableTopHeaderRow, { key: "fff-top-header-row", drawPausedComponent: drawPausedComponents }),
                    React.createElement(FileBasedFilterFarmTableHeaderRow, { key: "fff-header-row", tableObject: tableObject, headers: FFF_TABLE_TOP_HEADERS, drawPausedComponent: drawPausedComponents })),
                React.createElement("tbody", { className: "fff-table-body" }, buRows),
                React.createElement("tfoot", { className: "fff-table-foot" },
                    React.createElement(FileBasedFilterFarmTableHeaderRow, { key: "fff-summary-header-row", tableObject: tableObject, headers: FFF_TABLE_SUMMARY_HEADERS, drawPausedComponent: drawPausedComponents }),
                    React.createElement(FileBasedFilterFarmTableBUSummaryRow, { key: "fff-summary-row", buSummary: buSummary, numBus: numBus, numBusNoRate: numBusNoRate, drawPausedComponent: drawPausedComponents, drawZeroDataFlowComponent: drawZeroDataFlowComponents, drawStaleSnapshot: drawStaleSnapshot }))));
        }
    }
    class FileBasedFilterFarmTableTopHeaderRow extends React.Component {
        shouldComponentUpdate() {
            return false;
        }
        render() {
            let drawPausedComponent = this.props.drawPausedComponent;
            return (React.createElement("tr", { className: "fff-table-top-header-row" },
                React.createElement(FileBasedFilterFarmTableHeader, { additionalClasses: "fff-table-help", content: React.createElement("a", { href: "ffftablehelp.html", target: "_blank" }, "Table Help"), colSpan: 2, drawPausedComponent: drawPausedComponent }),
                React.createElement(FileBasedFilterFarmTableHeader, { content: "B U I L D E R   U N I T   ( B U )", colSpan: 20, drawPausedComponent: drawPausedComponent })));
        }
    }
    class FileBasedFilterFarmTableHeaderRow extends React.Component {
        render() {
            let drawPausedComponent = this.props.drawPausedComponent;
            let tableObject = this.props.tableObject;
            let children = [];
            this.props.headers.forEach(header => children.push(React.createElement(FileBasedFilterFarmTableHeader, { key: header.content, content: header.content, colSpan: header.colSpan, additionalClasses: header.additionalClasses, tableObject: tableObject, sorting: tableObject.getCurrentSorting(header.content), sortFunctions: header.sortFunctions })));
            return (React.createElement("tr", { className: "fff-table-header-row" }, children));
        }
    }
    class FileBasedFilterFarmTableHeader extends React.Component {
        shouldComponentUpdate(nextProps) {
            return this.props.sorting !== nextProps.sorting;
        }
        render() {
            let drawPausedComponent = this.props.drawPausedComponent;
            let content = this.props.content;
            let colSpan = this.props.colSpan;
            let additionalClasses = this.props.additionalClasses;
            let className = classNames("fff-table-header", additionalClasses);
            let tableObject = this.props.tableObject;
            let currentSorting = this.props.sorting ? this.props.sorting : null;
            let sortFunctions = this.props.sortFunctions;
            let clickFunction = null;
            if (currentSorting != null && sortFunctions != null) {
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
            let sortingImage = null;
            if (currentSorting != null) {
                sortingImage = React.createElement("input", { type: "image", className: "fff-table-sort-image", src: 'dist/img/' + currentSorting.getImagePath(), alt: currentSorting.toString(), title: "Sort", onClick: clickFunction });
            }
            return (React.createElement("th", { className: className, colSpan: colSpan ? colSpan : 1 },
                content,
                sortingImage));
        }
    }
    class FileBasedFilterFarmTableBURow extends React.Component {
        shouldComponentUpdate(nextProps) {
            let shouldUpdate = false;
            shouldUpdate = shouldUpdate || this.props.oddRow !== nextProps.oddRow;
            shouldUpdate = shouldUpdate || this.props.drawPausedComponent !== nextProps.drawPausedComponent;
            shouldUpdate = shouldUpdate || this.props.drawZeroDataFlowComponent !== nextProps.drawZeroDataFlowComponent;
            shouldUpdate = shouldUpdate || this.props.drawStaleSnapshot !== nextProps.drawStaleSnapshot;
            shouldUpdate = shouldUpdate || !DAQViewUtility.snapshotElementsEqualShallow(this.props.bu, nextProps.bu);
            return shouldUpdate;
        }
        render() {
            let drawPausedComponent = this.props.drawPausedComponent;
            let drawZeroDataFlowComponent = this.props.drawZeroDataFlowComponent;
            let drawStaleSnapshot = this.props.drawStaleSnapshot;
            let oddRow = this.props.oddRow;
            let bu = this.props.bu;
            let buUrl = 'http://' + bu.hostname + ':' + bu.port + '/urn:xdaq-application:service=bu';
            let buState = '';
            let buStateClass = 'fff-table-bu-state-normal';
            if (bu.stateName) {
                buState = bu.stateName;
                if (buState === 'Halted' || buState === 'Ready' || buState === 'Enabled' || buState === 'unknown' || buState === '') {
                    buState = '';
                }
                else {
                    buStateClass = 'fff-table-bu-state-warn';
                }
                if (buState === 'Failed' || buState === 'Error') {
                    buStateClass = 'fff-table-bu-state-error';
                }
            }
            let buJobCrashStateDisplay = "";
            let buJobCrashStateDisplayClass = "";
            if (bu.crashed) {
                buJobCrashStateDisplay = "JobCrash";
                buJobCrashStateDisplayClass = "fff-table-jobcrash";
            }
            let hostname = bu.hostname.split(".")[0];
            let buUrlDisplay = hostname;
            let buUrlDisplayClass = "fff-table-stale-member-wrapbox"; //assume stale and overwrite if not
            let buDebug = "Check problems with BU flashlist!";
            if (bu.port != null) {
                buUrlDisplay = React.createElement("a", { href: buUrl, target: "_blank" }, hostname);
                buUrlDisplayClass = "";
                buDebug = "";
            }
            let rate = FormatUtility.toFixedNumber(bu.rate / 1000, 3);
            let throughput = FormatUtility.toFixedNumber(bu.throughput / 1000 / 1000, 1);
            let sizeMean = FormatUtility.toFixedNumber(bu.eventSizeMean / 1000, 1);
            let sizeStddev = FormatUtility.toFixedNumber(bu.eventSizeStddev / 1000, 1);
            let events = bu.numEvents;
            let eventsInBU = bu.numEventsInBU;
            let requestsSent = bu.numRequestsSent;
            let requestsUsed = bu.numRequestsUsed;
            let requestsBlocked = bu.numRequestsBlocked;
            let fffBuRowClass = drawPausedComponent ? "fff-table-bu-row-paused" : "fff-table-bu-row-running";
            if (drawZeroDataFlowComponent) {
                fffBuRowClass = "fff-table-bu-row-ratezero";
            }
            let eventsInBuClass = FormatUtility.getClassNameForNumber(eventsInBU != null ? eventsInBU : 0, FFFTableNumberFormats.EVENTS_IN_BU);
            let priorityClass = FormatUtility.getClassNameForNumber(bu.priority != null ? bu.priority : 0, FFFTableNumberFormats.PRIORITY);
            let requestsSentClass = FormatUtility.getClassNameForNumber(requestsSent != null ? requestsSent : 0, FFFTableNumberFormats.REQUESTS_SENT);
            let requestsUsedClass = FormatUtility.getClassNameForNumber(requestsUsed != null ? requestsUsed : 0, FFFTableNumberFormats.REQUESTS_USED);
            let requestsBlockedClass = FormatUtility.getClassNameForNumber(requestsBlocked != null ? requestsBlocked : 0, FFFTableNumberFormats.REQUESTS_BLOCKED);
            //invert color when DAQ is stuck, because red colors are missed
            if (drawZeroDataFlowComponent && oddRow) {
                let escapeRedField = 'fff-table-bu-red-column-escape';
                if (eventsInBuClass === 'fff-table-events-in-bu') {
                    eventsInBuClass = escapeRedField;
                }
                if (requestsSentClass === 'fff-table-requests-sent') {
                    requestsSentClass = escapeRedField;
                }
                if (requestsUsedClass === 'fff-table-requests-used') {
                    requestsUsedClass = escapeRedField;
                }
                if (requestsBlockedClass === 'fff-table-requests-blocked') {
                    requestsBlockedClass = escapeRedField;
                }
            }
            if (drawZeroDataFlowComponent) {
                fffBuRowClass = "fff-table-bu-row-ratezero";
            }
            if (drawStaleSnapshot && (!drawPausedComponent)) {
                fffBuRowClass = 'fff-table-bu-row-stale-page-row';
            }
            return (React.createElement("tr", { className: fffBuRowClass },
                React.createElement("td", null,
                    React.createElement("div", { title: buDebug, className: buUrlDisplayClass }, buUrlDisplay)),
                React.createElement("td", null,
                    React.createElement("div", { className: buStateClass }, buState),
                    React.createElement("div", { className: buJobCrashStateDisplayClass }, buJobCrashStateDisplay)),
                React.createElement("td", { className: classNames("fff-table-bu-row-counter", FormatUtility.getClassNameForNumber(rate != null ? rate : 0, FFFTableNumberFormats.RATE)) }, rate != null ? rate.toFixed(3) : '*'),
                React.createElement("td", { className: classNames("fff-table-bu-row-counter", FormatUtility.getClassNameForNumber(throughput != null ? throughput : 0, FFFTableNumberFormats.THROUGHPUT)) }, throughput != null ? throughput.toFixed(1) : '*'),
                React.createElement("td", { className: classNames("fff-table-bu-row-counter", FormatUtility.getClassNameForNumber(sizeMean != null ? sizeMean : 0, FFFTableNumberFormats.SIZE)) },
                    sizeMean != null ? sizeMean.toFixed(1) : '*',
                    "\u00B1",
                    sizeStddev != null ? sizeStddev.toFixed(1) : '*'),
                React.createElement("td", { className: classNames("fff-table-bu-row-counter", FormatUtility.getClassNameForNumber(events != null ? events : 0, FFFTableNumberFormats.EVENTS)) }, events != null ? events : '*'),
                React.createElement("td", { className: classNames("fff-table-bu-row-counter", eventsInBuClass) }, eventsInBU != null ? eventsInBU : '*'),
                React.createElement("td", null,
                    React.createElement("div", { className: classNames("fff-table-bu-row-counter", priorityClass) }, bu.priority != null ? bu.priority : '*')),
                React.createElement("td", { className: classNames("fff-table-bu-row-counter", requestsSentClass) }, requestsSent != null ? requestsSent : '*'),
                React.createElement("td", { className: classNames("fff-table-bu-row-counter", requestsUsedClass) }, requestsUsed != null ? requestsUsed : '*'),
                React.createElement("td", null,
                    React.createElement("div", { className: classNames("fff-table-bu-row-counter", requestsBlockedClass) }, requestsBlocked != null ? requestsBlocked : '*')),
                React.createElement("td", { className: "fff-table-bu-row-counter" }, bu.numFUsHLT != null ? bu.numFUsHLT : '*'),
                React.createElement("td", { className: "fff-table-bu-row-counter" }, bu.numFUsCrashed != null ? bu.numFUsCrashed : '*'),
                React.createElement("td", { className: "fff-table-bu-row-counter" }, bu.numFUsStale != null ? bu.numFUsStale : '*'),
                React.createElement("td", { className: "fff-table-bu-row-counter" }, bu.numFUsCloud != null ? bu.numFUsCloud : '*'),
                React.createElement("td", { className: "fff-table-bu-row-counter" },
                    bu.ramDiskUsage != null ? (bu.ramDiskUsage).toFixed(1) : '*',
                    "% of ",
                    bu.ramDiskTotal != null ? bu.ramDiskTotal.toFixed(1) : '*',
                    "GB"),
                React.createElement("td", { className: "fff-table-bu-row-counter" }, bu.numFiles != null ? bu.numFiles : '*'),
                React.createElement("td", { className: "fff-table-bu-row-counter" }, bu.numLumisectionsWithFiles != null ? bu.numLumisectionsWithFiles : '*'),
                React.createElement("td", { className: "fff-table-bu-row-counter" }, bu.currentLumisection != null ? bu.currentLumisection : '*'),
                React.createElement("td", { className: "fff-table-bu-row-counter" }, bu.numLumisectionsForHLT != null ? bu.numLumisectionsForHLT : '*'),
                React.createElement("td", { className: "fff-table-bu-row-counter" }, bu.numLumisectionsOutHLT != null ? bu.numLumisectionsOutHLT : '*'),
                React.createElement("td", { className: classNames("fff-table-bu-row-counter", FormatUtility.getClassNameForNumber(bu.fuOutputBandwidthInMB != null ? bu.fuOutputBandwidthInMB : 0, FFFTableNumberFormats.BANDWIDTH)) }, bu.fuOutputBandwidthInMB != null ? bu.fuOutputBandwidthInMB.toFixed(2) : '*')));
        }
    }
    class FileBasedFilterFarmTableBUSummaryRow extends React.Component {
        shouldComponentUpdate(nextProps) {
            let shouldUpdate = false;
            shouldUpdate = shouldUpdate || this.props.numBus !== nextProps.numBus;
            shouldUpdate = shouldUpdate || this.props.numBusNoRate !== nextProps.numBusNoRate;
            shouldUpdate = shouldUpdate || this.props.drawPausedComponent !== nextProps.drawPausedComponent;
            shouldUpdate = shouldUpdate || this.props.drawZeroDataFlowComponent !== nextProps.drawZeroDataFlowComponent;
            shouldUpdate = shouldUpdate || this.props.drawStaleSnapshot !== nextProps.drawStaleSnapshot;
            shouldUpdate = shouldUpdate || !DAQViewUtility.snapshotElementsEqualShallow(this.props.buSummary, nextProps.buSummary);
            return shouldUpdate;
        }
        render() {
            let buSummary = this.props.buSummary;
            let drawPausedComponent = this.props.drawPausedComponent;
            let drawZeroDataFlowComponent = this.props.drawZeroDataFlowComponent;
            let drawStaleSnapshot = this.props.drawStaleSnapshot;
            let fffBuSummaryRowClass = drawPausedComponent ? "fff-table-bu-summary-row-paused" : "fff-table-bu-summary-row-running";
            let eventsInBuClass = FormatUtility.getClassNameForNumber(buSummary.numEventsInBU != null ? buSummary.numEventsInBU : 0, FFFTableNumberFormats.EVENTS_IN_BU);
            let requestsSentClass = FormatUtility.getClassNameForNumber(buSummary.numRequestsSent != null ? buSummary.numRequestsSent : 0, FFFTableNumberFormats.REQUESTS_SENT);
            let requestsUsedClass = FormatUtility.getClassNameForNumber(buSummary.numRequestsUsed != null ? buSummary.numRequestsUsed : 0, FFFTableNumberFormats.REQUESTS_USED);
            let requestsBlockedClass = 'fff-table-requests-blocked';
            if (drawZeroDataFlowComponent) {
                fffBuSummaryRowClass = "fff-table-bu-summary-row-ratezero";
                if (!drawStaleSnapshot) {
                    let escapeRedField = 'fff-table-bu-red-column-escape';
                    if (eventsInBuClass === 'fff-table-events-in-bu') {
                        eventsInBuClass = escapeRedField;
                    }
                    if (requestsSentClass === 'fff-table-requests-sent') {
                        requestsSentClass = escapeRedField;
                    }
                    if (requestsUsedClass === 'fff-table-requests-used') {
                        requestsUsedClass = escapeRedField;
                    }
                    if (requestsBlockedClass === 'fff-table-requests-blocked') {
                        requestsBlockedClass = escapeRedField;
                    }
                }
            }
            if (drawStaleSnapshot && (!drawPausedComponent)) {
                fffBuSummaryRowClass = 'fff-table-bu-summary-row-stale-page';
            }
            return (React.createElement("tr", { className: classNames(fffBuSummaryRowClass, "fff-table-bu-row-counter") },
                React.createElement("td", null,
                    "\u03A3 BUs = ",
                    this.props.numBusNoRate,
                    " / ",
                    this.props.numBus),
                React.createElement("td", null),
                React.createElement("td", { className: FormatUtility.getClassNameForNumber(buSummary.rate != null ? buSummary.rate / 1000 : 0, FFFTableNumberFormats.RATE) },
                    "\u03A3 ",
                    buSummary.rate != null ? (buSummary.rate / 1000).toFixed(3) : '*'),
                React.createElement("td", { className: FormatUtility.getClassNameForNumber(buSummary.throughput != null ? buSummary.throughput / 1000 / 1000 : 0, FFFTableNumberFormats.THROUGHPUT) },
                    "\u03A3 ",
                    buSummary.throughput != null ? (buSummary.throughput / 1000 / 1000).toFixed(1) : '*'),
                React.createElement("td", { className: FormatUtility.getClassNameForNumber(buSummary.eventSizeMean != null ? buSummary.eventSizeMean / 1000 : 0, FFFTableNumberFormats.SIZE) },
                    buSummary.eventSizeMean != null ? (buSummary.eventSizeMean / 1000).toFixed(1) : '*',
                    "\u00B1",
                    buSummary.eventSizeStddev != null ? (buSummary.eventSizeStddev / 1000).toFixed(1) : '*'),
                React.createElement("td", { className: FormatUtility.getClassNameForNumber(buSummary.numEvents != null ? buSummary.numEvents : 0, FFFTableNumberFormats.EVENTS) },
                    "\u03A3 ",
                    buSummary.numEvents != null ? buSummary.numEvents : '*'),
                React.createElement("td", { className: eventsInBuClass },
                    "\u03A3 ",
                    buSummary.numEventsInBU != null ? buSummary.numEventsInBU : '*'),
                React.createElement("td", { className: "fff-table-priority" }, buSummary.priority != null ? buSummary.priority : '*'),
                React.createElement("td", { className: requestsSentClass },
                    "\u03A3 ",
                    buSummary.numRequestsSent != null ? buSummary.numRequestsSent : '*'),
                React.createElement("td", { className: requestsUsedClass },
                    "\u03A3 ",
                    buSummary.numRequestsUsed != null ? buSummary.numRequestsUsed : '*'),
                React.createElement("td", { className: requestsBlockedClass },
                    "\u03A3 ",
                    buSummary.numRequestsBlocked != null ? buSummary.numRequestsBlocked : '*'),
                React.createElement("td", null,
                    "\u03A3 ",
                    buSummary.numFUsHLT != null ? buSummary.numFUsHLT : '*'),
                React.createElement("td", null,
                    "\u03A3 ",
                    buSummary.numFUsCrashed != null ? buSummary.numFUsCrashed : '*'),
                React.createElement("td", null,
                    "\u03A3 ",
                    buSummary.numFUsStale != null ? buSummary.numFUsStale : '*'),
                React.createElement("td", null,
                    "\u03A3 ",
                    buSummary.numFUsCloud != null ? buSummary.numFUsCloud : '*'),
                React.createElement("td", null,
                    "\u03A3 ",
                    buSummary.ramDiskUsage != null ? buSummary.ramDiskUsage.toFixed(1) : '*',
                    "% of ",
                    buSummary.ramDiskTotal != null ? buSummary.ramDiskTotal.toFixed(1) : '*',
                    "GB"),
                React.createElement("td", null,
                    "\u03A3 ",
                    buSummary.numFiles != null ? buSummary.numFiles : '*'),
                React.createElement("td", null, buSummary.numLumisectionsWithFiles != null ? buSummary.numLumisectionsWithFiles : '*'),
                React.createElement("td", null, buSummary.currentLumisection != null ? buSummary.currentLumisection : '*'),
                React.createElement("td", null, buSummary.numLumisectionsForHLT != null ? buSummary.numLumisectionsForHLT : '*'),
                React.createElement("td", null, buSummary.numLumisectionsOutHLT != null ? buSummary.numLumisectionsOutHLT : '*'),
                React.createElement("td", null, buSummary.fuOutputBandwidthInMB != null ? buSummary.fuOutputBandwidthInMB.toFixed(2) : '*')));
        }
    }
})(DAQView || (DAQView = {}));
