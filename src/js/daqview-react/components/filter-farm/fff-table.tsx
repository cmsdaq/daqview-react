/**
 * @author Michail Vougioukas
 * @author Philipp Brummer
 */

namespace DAQView {

    import DAQAggregatorSnapshot = DAQAggregator.Snapshot;
    import DAQ = DAQAggregator.Snapshot.DAQ;

    export class FileBasedFilterFarmTable implements DAQView.DAQSnapshotView {
        private DEFAULT_PRESORT_FUNCTION: (snapshot: DAQAggregatorSnapshot) => DAQAggregatorSnapshot = FFFTableSortFunctions.BU_HOSTNAME_ASC;

        private INITIAL_SORT_FUNCTION: (snapshot: DAQAggregatorSnapshot) => DAQAggregatorSnapshot = FFFTableSortFunctions.BU_HOSTNAME_ASC;
        private INITIAL_PRESORT_FUNCTION: (snapshot: DAQAggregatorSnapshot) => DAQAggregatorSnapshot = FFFTableSortFunctions.NONE;

        public htmlRootElement: Element;

        private snapshot: DAQAggregatorSnapshot = null;
        private drawPausedComponent: boolean = false;
        private drawZeroDataFlowComponent: boolean = false;
        private drawStaleSnapshot: boolean = false;

        private sortFunction: SortFunction = {
            presort: this.INITIAL_PRESORT_FUNCTION,
            sort: this.INITIAL_SORT_FUNCTION
        };

        private currentSorting: {[key: string]: Sorting} = {
            'BU': Sorting.Ascending,
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
            '#LS w/ files': Sorting.None,
            'current LS': Sorting.None,
            '#LS for HLT': Sorting.None,
            '#LS out HLT': Sorting.None,
            'b/w out (MB/s)': Sorting.None
        };

        constructor(htmlRootElementName: string, configuration: DAQViewConfiguration) {
            this.htmlRootElement = document.getElementById(htmlRootElementName);
        }

        public setSnapshot(snapshot: DAQAggregatorSnapshot, drawPausedComponent: boolean, drawZeroDataFlowComponent:boolean, drawStaleSnapshot:boolean) {
            if (!snapshot){
                let msg: string = "";
                let errRootElement: any = <ErrorElement message={msg}/>;
                ReactDOM.render(errRootElement, this.htmlRootElement);
            }else {
                if (this.snapshot != null && this.snapshot.getUpdateTimestamp() === snapshot.getUpdateTimestamp()) {
                    console.log("duplicate snapshot detected");
                    if (drawPausedComponent || drawZeroDataFlowComponent || drawStaleSnapshot) {
                        console.log("...but page color has to change, so do render");
                    } else {
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
        public prePassElementSpecificData(args: string []){

        }

        private updateSnapshot() {
            let sortedSnapshot: DAQAggregatorSnapshot = this.sort(this.snapshot);
            let daq: DAQAggregatorSnapshot.DAQ = sortedSnapshot.getDAQ();
            let drawPausedComponent: boolean = this.drawPausedComponent;
            let drawZeroDataFlowComponent: boolean = this.drawZeroDataFlowComponent;
            let drawStaleSnapshot = this.drawStaleSnapshot;
            let fileBasedFilterFarmTableRootElement: any = <FileBasedFilterFarmTableElement tableObject={this}
                                                                                            bus={daq.bus}
                                                                                            buSummary={daq.buSummary}
                                                                                            drawPausedComponent={drawPausedComponent}
                                                                                            drawZeroDataFlowComponent={drawZeroDataFlowComponent}
                                                                                            drawStaleSnapshot={drawStaleSnapshot}/>;
            ReactDOM.render(fileBasedFilterFarmTableRootElement, this.htmlRootElement);
        }

        public setSortFunction(sortFunctions: SortFunction) {
            let presortFunction: (snapshot: DAQAggregatorSnapshot) => DAQAggregatorSnapshot;
            let sortFunction: (snapshot: DAQAggregatorSnapshot) => DAQAggregatorSnapshot;

            if (sortFunctions.hasOwnProperty('presort')) {
                presortFunction = sortFunctions.presort;
            } else {
                presortFunction = this.DEFAULT_PRESORT_FUNCTION;
            }
            sortFunction = sortFunctions.sort;

            this.sortFunction = {presort: presortFunction, sort: sortFunction};
            this.updateSnapshot();
        }

        public sort(snapshot: DAQAggregatorSnapshot): DAQAggregatorSnapshot {
            return this.sortFunction.sort(this.sortFunction.presort(snapshot));
        }

        public setCurrentSorting(headerName: string, sorting: Sorting) {
            DAQViewUtility.forEachOwnObjectProperty(this.currentSorting, (header: string) => this.currentSorting[header] = Sorting.None);
            this.currentSorting[headerName] = sorting;
        }

        public getCurrentSorting(headerName: string) {
            if (!this.currentSorting.hasOwnProperty(headerName)) {
                return null;
            }
            return this.currentSorting[headerName];
        }
    }

    interface ErrorElementProperties {
        message: string;
    }

    class ErrorElement extends React.Component<ErrorElementProperties,{}> {
        render() {
            return (
                <div>{this.props.message}</div>
            );
        }
    }

    export namespace FFFTableSortFunctions {
        export function NONE(snapshot: DAQAggregatorSnapshot): DAQAggregatorSnapshot {
            return snapshot;
        }

        function BU_SORT(snapshot: DAQAggregatorSnapshot, attribute: string, descending: boolean): DAQAggregatorSnapshot {
            let daq: DAQAggregatorSnapshot.DAQ = snapshot.getDAQ();
            let bus: DAQAggregatorSnapshot.BU[] = daq.bus;
            bus.sort(function (firstBU: DAQAggregatorSnapshot.BU, secondBU: DAQAggregatorSnapshot.BU) {
                let firstBUValue = firstBU[attribute];
                let secondBUValue = secondBU[attribute];

                if (firstBUValue > secondBUValue) {
                    return (descending ? -1 : 1);
                } else if (firstBUValue < secondBUValue) {
                    return (descending ? 1 : -1);
                } else {
                    return 0;
                }
            });
            daq.bus = bus;
            return snapshot;
        }

        export function BU_HOSTNAME_ASC(snapshot: DAQAggregatorSnapshot) {
            return BU_SORT(snapshot, 'hostname', false);
        }

        export function BU_HOSTNAME_DESC(snapshot: DAQAggregatorSnapshot) {
            return BU_SORT(snapshot, 'hostname', true);
        }

        export function BU_RATE_ASC(snapshot: DAQAggregatorSnapshot) {
            return BU_SORT(snapshot, 'rate', false);
        }

        export function BU_RATE_DESC(snapshot: DAQAggregatorSnapshot) {
            return BU_SORT(snapshot, 'rate', true);
        }

        export function BU_THROUGHPUT_ASC(snapshot: DAQAggregatorSnapshot) {
            return BU_SORT(snapshot, 'throughput', false);
        }

        export function BU_THROUGHPUT_DESC(snapshot: DAQAggregatorSnapshot) {
            return BU_SORT(snapshot, 'throughput', true);
        }

        export function BU_EVENTSIZEMEAN_ASC(snapshot: DAQAggregatorSnapshot) {
            return BU_SORT(snapshot, 'eventSizeMean', false);
        }

        export function BU_EVENTSIZEMEAN_DESC(snapshot: DAQAggregatorSnapshot) {
            return BU_SORT(snapshot, 'eventSizeMean', true);
        }

        export function BU_NUMEVENTS_ASC(snapshot: DAQAggregatorSnapshot) {
            return BU_SORT(snapshot, 'numEvents', false);
        }

        export function BU_NUMEVENTS_DESC(snapshot: DAQAggregatorSnapshot) {
            return BU_SORT(snapshot, 'numEvents', true);
        }

        export function BU_NUMEVENTSINBU_ASC(snapshot: DAQAggregatorSnapshot) {
            return BU_SORT(snapshot, 'numEventsInBU', false);
        }

        export function BU_NUMEVENTSINBU_DESC(snapshot: DAQAggregatorSnapshot) {
            return BU_SORT(snapshot, 'numEventsInBU', true);
        }

        export function BU_PRIORITY_ASC(snapshot: DAQAggregatorSnapshot) {
            return BU_SORT(snapshot, 'priority', false);
        }

        export function BU_PRIORITY_DESC(snapshot: DAQAggregatorSnapshot) {
            return BU_SORT(snapshot, 'priority', true);
        }

        export function BU_NUMREQUESTSSENT_ASC(snapshot: DAQAggregatorSnapshot) {
            return BU_SORT(snapshot, 'numRequestsSent', false);
        }

        export function BU_NUMREQUESTSSENT_DESC(snapshot: DAQAggregatorSnapshot) {
            return BU_SORT(snapshot, 'numRequestsSent', true);
        }

        export function BU_NUMREQUESTSUSED_ASC(snapshot: DAQAggregatorSnapshot) {
            return BU_SORT(snapshot, 'numRequestsUsed', false);
        }

        export function BU_NUMREQUESTSUSED_DESC(snapshot: DAQAggregatorSnapshot) {
            return BU_SORT(snapshot, 'numRequestsUsed', true);
        }

        export function BU_NUMREQUESTSBLOCKED_ASC(snapshot: DAQAggregatorSnapshot) {
            return BU_SORT(snapshot, 'numRequestsBlocked', false);
        }

        export function BU_NUMREQUESTSBLOCKED_DESC(snapshot: DAQAggregatorSnapshot) {
            return BU_SORT(snapshot, 'numRequestsBlocked', true);
        }

        export function BU_NUMFUSHLT_ASC(snapshot: DAQAggregatorSnapshot) {
            return BU_SORT(snapshot, 'numFUsHLT', false);
        }

        export function BU_NUMFUSHLT_DESC(snapshot: DAQAggregatorSnapshot) {
            return BU_SORT(snapshot, 'numFUsHLT', true);
        }

        export function BU_NUMFUSCRASHED_ASC(snapshot: DAQAggregatorSnapshot) {
            return BU_SORT(snapshot, 'numFUsCrashed', false);
        }

        export function BU_NUMFUSCRASHED_DESC(snapshot: DAQAggregatorSnapshot) {
            return BU_SORT(snapshot, 'numFUsCrashed', true);
        }

        export function BU_NUMFUSSTALE_ASC(snapshot: DAQAggregatorSnapshot) {
            return BU_SORT(snapshot, 'numFUsStale', false);
        }

        export function BU_NUMFUSSTALE_DESC(snapshot: DAQAggregatorSnapshot) {
            return BU_SORT(snapshot, 'numFUsStale', true);
        }

        export function BU_NUMFUSCLOUD_ASC(snapshot: DAQAggregatorSnapshot) {
            return BU_SORT(snapshot, 'numFUsCloud', false);
        }

        export function BU_NUMFUSCLOUD_DESC(snapshot: DAQAggregatorSnapshot) {
            return BU_SORT(snapshot, 'numFUsCloud', true);
        }

        export function BU_RAMDISKUSAGE_ASC(snapshot: DAQAggregatorSnapshot) {
            return BU_SORT(snapshot, 'ramDiskUsage', false);
        }

        export function BU_RAMDISKUSAGE_DESC(snapshot: DAQAggregatorSnapshot) {
            return BU_SORT(snapshot, 'ramDiskUsage', true);
        }

        export function BU_NUMFILES_ASC(snapshot: DAQAggregatorSnapshot) {
            return BU_SORT(snapshot, 'numFiles', false);
        }

        export function BU_NUMFILES_DESC(snapshot: DAQAggregatorSnapshot) {
            return BU_SORT(snapshot, 'numFiles', true);
        }

        export function BU_CURRENTLUMISECTION_ASC(snapshot: DAQAggregatorSnapshot) {
            return BU_SORT(snapshot, 'currentLumisection', false);
        }

        export function BU_CURRENTLUMISECTION_DESC(snapshot: DAQAggregatorSnapshot) {
            return BU_SORT(snapshot, 'currentLumisection', true);
        }

        export function BU_FUOUTPUTBANDWIDTHINMB_ASC(snapshot: DAQAggregatorSnapshot) {
            return BU_SORT(snapshot, 'fuOutputBandwidthInMB', false);
        }

        export function BU_FUOUTPUTBANDWIDTHINMB_DESC(snapshot: DAQAggregatorSnapshot) {
            return BU_SORT(snapshot, 'fuOutputBandwidthInMB', true);
        }

        export function BU_NUMLUMISECTIONSWITHFILES_ASC(snapshot: DAQAggregatorSnapshot) {
            return BU_SORT(snapshot, 'numLumisectionsWithFiles', false);
        }

        export function BU_NUMLUMISECTIONSWITHFILES_DESC(snapshot: DAQAggregatorSnapshot) {
            return BU_SORT(snapshot, 'numLumisectionsWithFiles', true);
        }

        export function BU_NUMLUMISECTIONSFORHLT_ASC(snapshot: DAQAggregatorSnapshot) {
            return BU_SORT(snapshot, 'numLumisectionsForHLT', false);
        }

        export function BU_NUMLUMISECTIONSFORHLT_DESC(snapshot: DAQAggregatorSnapshot) {
            return BU_SORT(snapshot, 'numLumisectionsForHLT', true);
        }

        export function BU_NUMLUMISECTIONSOUTHLT_ASC(snapshot: DAQAggregatorSnapshot) {
            return BU_SORT(snapshot, 'numLumisectionsOutHLT', false);
        }

        export function BU_NUMLUMISECTIONSOUTHLT_DESC(snapshot: DAQAggregatorSnapshot) {
            return BU_SORT(snapshot, 'numLumisectionsOutHLT', true);
        }

    }

    export namespace FFFTableNumberFormats {

        export const RATE: FormatUtility.NumberFormat = {
            baseStyle: 'fff-table-rate',
            formats: [{min: 0, max: 0, styleSuffix: '-zero'}, {styleSuffix: '-nonzero'}]
        };

        export const THROUGHPUT: FormatUtility.NumberFormat = {
            baseStyle: 'fff-table-throughput',
            formats: [{min: 0, max: 0, styleSuffix: '-zero'}, {styleSuffix: '-nonzero'}]
        };

        export const SIZE: FormatUtility.NumberFormat = {
            baseStyle: 'fff-table-size',
            formats: [{min: 0, max: 0, styleSuffix: '-zero'}, {styleSuffix: '-nonzero'}]
        };

        export const EVENTS: FormatUtility.NumberFormat = {
            baseStyle: 'fff-table-events'
        };

        export const EVENTS_IN_BU: FormatUtility.NumberFormat = {
            baseStyle: 'fff-table-events-in-bu'
        };

        export const REQUESTS_SENT: FormatUtility.NumberFormat = {
            baseStyle: 'fff-table-requests-sent'
        };

        export const REQUESTS_USED: FormatUtility.NumberFormat = {
            baseStyle: 'fff-table-requests-used'
        };

        export const REQUESTS_BLOCKED: FormatUtility.NumberFormat = {
            baseStyle: 'fff-table-requests-blocked',
            formats: [{min: 1, max: 1000000, styleSuffix: '-nonzero'}]
        };

        export const PRIORITY: FormatUtility.NumberFormat = {
            baseStyle: 'fff-table-priority',
            formats: [{min: 1, max: 1000000, styleSuffix: '-nonzero'}]
        };

        export const BANDWIDTH: FormatUtility.NumberFormat = {
            baseStyle: 'fff-table-bwout',
            formats: [{min: 100, max: 1000000, styleSuffix: '-over'}, {styleSuffix: ''}]
        };



    }

    const FFF_TABLE_BASE_HEADERS: FileBasedFilterFarmTableHeaderProperties[] = [
        {
            content: ''
        },
        {
            content: 'rate (kHz)',
            sortFunctions: {
                Ascending: {sort: FFFTableSortFunctions.BU_RATE_ASC},
                Descending: {sort: FFFTableSortFunctions.BU_RATE_DESC}
            }
        },
        {
            content: 'thru (MB/s)',
            sortFunctions: {
                Ascending: {sort: FFFTableSortFunctions.BU_THROUGHPUT_ASC},
                Descending: {sort: FFFTableSortFunctions.BU_THROUGHPUT_DESC}
            }
        },
        {
            content: 'size (kB)',
            sortFunctions: {
                Ascending: {sort: FFFTableSortFunctions.BU_EVENTSIZEMEAN_ASC},
                Descending: {sort: FFFTableSortFunctions.BU_EVENTSIZEMEAN_DESC}
            }
        },
        {
            content: '#events',
            sortFunctions: {
                Ascending: {sort: FFFTableSortFunctions.BU_NUMEVENTS_ASC},
                Descending: {sort: FFFTableSortFunctions.BU_NUMEVENTS_DESC}
            }
        },
        {
            content: '#evts in BU',
            sortFunctions: {
                Ascending: {sort: FFFTableSortFunctions.BU_NUMEVENTSINBU_ASC},
                Descending: {sort: FFFTableSortFunctions.BU_NUMEVENTSINBU_DESC}
            }
        },
        {
            content: 'priority',
            sortFunctions: {
                Ascending: {sort: FFFTableSortFunctions.BU_PRIORITY_ASC},
                Descending: {sort: FFFTableSortFunctions.BU_PRIORITY_DESC}
            }
        },
        {
            content: '#req. sent',
            sortFunctions: {
                Ascending: {sort: FFFTableSortFunctions.BU_NUMREQUESTSSENT_ASC},
                Descending: {sort: FFFTableSortFunctions.BU_NUMREQUESTSSENT_DESC}
            }
        },
        {
            content: '#req. used',
            sortFunctions: {
                Ascending: {sort: FFFTableSortFunctions.BU_NUMREQUESTSUSED_ASC},
                Descending: {sort: FFFTableSortFunctions.BU_NUMREQUESTSUSED_DESC}
            }
        },
        {
            content: '#req. blocked',
            sortFunctions: {
                Ascending: {sort: FFFTableSortFunctions.BU_NUMREQUESTSBLOCKED_ASC},
                Descending: {sort: FFFTableSortFunctions.BU_NUMREQUESTSBLOCKED_DESC}
            }
        },
        {
            content: '#FUs HLT',
            sortFunctions: {
                Ascending: {sort: FFFTableSortFunctions.BU_NUMFUSHLT_ASC},
                Descending: {sort: FFFTableSortFunctions.BU_NUMFUSHLT_DESC}
            }
        },
        {
            content: '#FUs crash',
            sortFunctions: {
                Ascending: {sort: FFFTableSortFunctions.BU_NUMFUSCRASHED_ASC},
                Descending: {sort: FFFTableSortFunctions.BU_NUMFUSCRASHED_DESC}
            }
        },
        {
            content: '#FUs stale',
            sortFunctions: {
                Ascending: {sort: FFFTableSortFunctions.BU_NUMFUSSTALE_ASC},
                Descending: {sort: FFFTableSortFunctions.BU_NUMFUSSTALE_DESC}
            }
        },
        {
            content: '#FUs cloud',
            sortFunctions: {
                Ascending: {sort: FFFTableSortFunctions.BU_NUMFUSCLOUD_ASC},
                Descending: {sort: FFFTableSortFunctions.BU_NUMFUSCLOUD_DESC}
            }
        },
        {
            content: 'RAM disk usage',
            sortFunctions: {
                Ascending: {sort: FFFTableSortFunctions.BU_RAMDISKUSAGE_ASC},
                Descending: {sort: FFFTableSortFunctions.BU_RAMDISKUSAGE_DESC}
            }
        },
        {
            content: '#files',
            sortFunctions: {
                Ascending: {sort: FFFTableSortFunctions.BU_NUMFILES_ASC},
                Descending: {sort: FFFTableSortFunctions.BU_NUMFILES_DESC}
            }
        },
        {
            content: '#LS w/ files',
            sortFunctions: {
                Ascending: {sort: FFFTableSortFunctions.BU_NUMLUMISECTIONSWITHFILES_ASC},
                Descending: {sort: FFFTableSortFunctions.BU_NUMLUMISECTIONSWITHFILES_DESC}
            }
        },
        {
            content: 'current LS',
            sortFunctions: {
                Ascending: {sort: FFFTableSortFunctions.BU_CURRENTLUMISECTION_ASC},
                Descending: {sort: FFFTableSortFunctions.BU_CURRENTLUMISECTION_DESC}
            }
        },
        {
            content: '#LS for HLT',
            sortFunctions: {
                Ascending: {sort: FFFTableSortFunctions.BU_NUMLUMISECTIONSFORHLT_ASC},
                Descending: {sort: FFFTableSortFunctions.BU_NUMLUMISECTIONSFORHLT_DESC}
            }
        },
        {
            content: '#LS out HLT',
            sortFunctions: {
                Ascending: {sort: FFFTableSortFunctions.BU_NUMLUMISECTIONSOUTHLT_ASC},
                Descending: {sort: FFFTableSortFunctions.BU_NUMLUMISECTIONSOUTHLT_DESC}
            }
        },
        {
            content: 'b/w out (MB/s)',
            sortFunctions: {
                Ascending: {sort: FFFTableSortFunctions.BU_FUOUTPUTBANDWIDTHINMB_ASC},
                Descending: {sort: FFFTableSortFunctions.BU_FUOUTPUTBANDWIDTHINMB_DESC}
            }
        }
    ];

    const FFF_TABLE_TOP_HEADERS: FileBasedFilterFarmTableHeaderProperties[] = FFF_TABLE_BASE_HEADERS.slice();
    FFF_TABLE_TOP_HEADERS.unshift(
        {
            content: 'BU',
            sortFunctions: {
                Ascending: {presort: FFFTableSortFunctions.NONE, sort: FFFTableSortFunctions.BU_HOSTNAME_ASC},
                Descending: {presort: FFFTableSortFunctions.NONE, sort: FFFTableSortFunctions.BU_HOSTNAME_DESC}
            }
        },
        {
            content: ''
        }
    );

    const FFF_TABLE_SUMMARY_HEADERS: FileBasedFilterFarmTableHeaderProperties[] = FFF_TABLE_BASE_HEADERS.slice();
    FFF_TABLE_SUMMARY_HEADERS.unshift({content: 'Summary'});

    interface FileBasedFilterFarmTableElementProperties {
        tableObject: FileBasedFilterFarmTable;
        bus: DAQAggregatorSnapshot.BU[];
        buSummary: DAQAggregatorSnapshot.BUSummary;
        drawPausedComponent: boolean;
        drawZeroDataFlowComponent: boolean;
        drawStaleSnapshot: boolean;
    }

    class FileBasedFilterFarmTableElement extends React.Component<FileBasedFilterFarmTableElementProperties,{}> {

        render() {
            let buSummary: DAQAggregatorSnapshot.BUSummary = this.props.buSummary;
            let bus: DAQAggregatorSnapshot.BU[] = this.props.bus;
            let numBus: number = 0;

            let drawPausedComponents: boolean = this.props.drawPausedComponent;
            let drawZeroDataFlowComponents: boolean = this.props.drawZeroDataFlowComponent;
            let drawStaleSnapshot = this.props.drawStaleSnapshot;

            let buRows: any[] = [];
            if (bus != null) {
                numBus = bus.length;
                bus.forEach( function (bu){
                    let index: number = buRows.length;
                    let oddRow: boolean = (index % 2 == 1)? true : false;

                    buRows.push(<FileBasedFilterFarmTableBURow key={bu['@id']} bu={bu} drawPausedComponent={drawPausedComponents} drawZeroDataFlowComponent={drawZeroDataFlowComponents} oddRow={oddRow} drawStaleSnapshot={drawStaleSnapshot}/>);
                })
            }
            let numBusNoRate:number = numBus - buSummary.busNoRate;

            let tableObject: FileBasedFilterFarmTable = this.props.tableObject;

            return (
                <table className="fff-table">
                    <thead className="fff-table-head">
                    <FileBasedFilterFarmTableTopHeaderRow key="fff-top-header-row" drawPausedComponent={drawPausedComponents}/>
                    <FileBasedFilterFarmTableHeaderRow key="fff-header-row" tableObject={tableObject}
                                                       headers={FFF_TABLE_TOP_HEADERS} drawPausedComponent={drawPausedComponents}/>
                    </thead>
                    <tbody className="fff-table-body">
                    {buRows}
                    </tbody>
                    <tfoot className="fff-table-foot">
                    <FileBasedFilterFarmTableHeaderRow key="fff-summary-header-row" tableObject={tableObject}
                                                       headers={FFF_TABLE_SUMMARY_HEADERS} drawPausedComponent={drawPausedComponents}/>
                    <FileBasedFilterFarmTableBUSummaryRow key="fff-summary-row" buSummary={buSummary} numBus={numBus} numBusNoRate={numBusNoRate} drawPausedComponent={drawPausedComponents} drawZeroDataFlowComponent={drawZeroDataFlowComponents} drawStaleSnapshot={drawStaleSnapshot}/>
                    </tfoot>
                </table>
            );
        }
    }

    interface FileBasedFilterFarmTableTopHeaderRowProperties {
        drawPausedComponent: boolean;
    }

    class FileBasedFilterFarmTableTopHeaderRow extends React.Component<FileBasedFilterFarmTableTopHeaderRowProperties,{}> {
        shouldComponentUpdate() {
            return false;
        }

        render() {
            let drawPausedComponent: boolean = this.props.drawPausedComponent;
            return (
                <tr className="fff-table-top-header-row">
                    <FileBasedFilterFarmTableHeader additionalClasses="fff-table-help"
                                                    content={<a href="ffftablehelp.html" target="_blank">Table Help</a>} colSpan={2} drawPausedComponent={drawPausedComponent}/>
                    <FileBasedFilterFarmTableHeader content="B U I L D E R   U N I T   ( B U )" colSpan={20} drawPausedComponent={drawPausedComponent}/>
                </tr>
            );
        }
    }

    interface FileBasedFilterFarmTableHeaderRowProperties {
        headers: FileBasedFilterFarmTableHeaderProperties[];
        tableObject: FileBasedFilterFarmTable;
        drawPausedComponent: boolean;
    }

    class FileBasedFilterFarmTableHeaderRow extends React.Component<FileBasedFilterFarmTableHeaderRowProperties,{}> {
        render() {
            let drawPausedComponent: boolean = this.props.drawPausedComponent;
            let tableObject: FileBasedFilterFarmTable = this.props.tableObject;

            let children: any[] = [];
            this.props.headers.forEach(header => children.push(<FileBasedFilterFarmTableHeader
                key={header.content}
                content={header.content}
                colSpan={header.colSpan}
                additionalClasses={header.additionalClasses}
                tableObject={tableObject}
                sorting={tableObject.getCurrentSorting(header.content)}
                sortFunctions={header.sortFunctions}/>));
            return (
                <tr className="fff-table-header-row">
                    {children}
                </tr>
            );
        }
    }

    interface FileBasedFilterFarmTableHeaderProperties {
        content: any;
        colSpan?: number;
        additionalClasses?: string | string[];
        tableObject?: FileBasedFilterFarmTable;
        sorting?: Sorting;
        sortFunctions?: { [key: string]: SortFunction };
        drawPausedComponent?: boolean;
    }

    class FileBasedFilterFarmTableHeader extends React.Component<FileBasedFilterFarmTableHeaderProperties,{}> {
        shouldComponentUpdate(nextProps: FileBasedFilterFarmTableHeaderProperties) {
            return this.props.sorting !== nextProps.sorting;
        }

        render() {
            let drawPausedComponent: boolean = this.props.drawPausedComponent;
            let content: string = this.props.content;
            let colSpan: number = this.props.colSpan;
            let additionalClasses: string | string[] = this.props.additionalClasses;
            let className: string = classNames("fff-table-header", additionalClasses);

            let tableObject: FileBasedFilterFarmTable = this.props.tableObject;
            let currentSorting: Sorting = this.props.sorting ? this.props.sorting : null;
            let sortFunctions: { [key: string]: SortFunction } = this.props.sortFunctions;

            let clickFunction: () => void = null;
            if (currentSorting != null && sortFunctions != null) {
                if (currentSorting === Sorting.None || currentSorting === Sorting.Descending) {
                    clickFunction = function () {
                        tableObject.setSortFunction.bind(tableObject)(sortFunctions[Sorting.Ascending.toString()]);
                        tableObject.setCurrentSorting.bind(tableObject)(content, Sorting.Ascending);
                    };
                } else if (currentSorting === Sorting.Ascending) {
                    clickFunction = function () {
                        tableObject.setSortFunction.bind(tableObject)(sortFunctions[Sorting.Descending.toString()]);
                        tableObject.setCurrentSorting.bind(tableObject)(content, Sorting.Descending);
                    };
                }
            }

            let sortingImage: any = null;
            if (currentSorting != null) {
                sortingImage = <input type="image" className="fff-table-sort-image"
                                      src={'dist/img/' + currentSorting.getImagePath()}
                                      alt={currentSorting.toString()}
                                      title="Sort" onClick={clickFunction}/>;
            }

            return (
                <th className={className} colSpan={colSpan ? colSpan : 1}>
                    {content}{sortingImage}
                </th>
            );
        }
    }

    interface FileBasedFilterFarmTableBURowProperties {
        bu: DAQAggregatorSnapshot.BU;
        drawPausedComponent: boolean;
        drawZeroDataFlowComponent: boolean;
        oddRow:boolean;
        drawStaleSnapshot:boolean;
    }

    class FileBasedFilterFarmTableBURow extends React.Component<FileBasedFilterFarmTableBURowProperties,{}> {
        shouldComponentUpdate(nextProps: FileBasedFilterFarmTableBURowProperties) {
            let shouldUpdate: boolean = false;

            shouldUpdate = shouldUpdate || this.props.oddRow !== nextProps.oddRow;
            shouldUpdate = shouldUpdate || this.props.drawPausedComponent !== nextProps.drawPausedComponent;
            shouldUpdate = shouldUpdate || this.props.drawZeroDataFlowComponent !== nextProps.drawZeroDataFlowComponent;
            shouldUpdate = shouldUpdate || this.props.drawStaleSnapshot !== nextProps.drawStaleSnapshot;
            shouldUpdate = shouldUpdate || !DAQViewUtility.snapshotElementsEqualShallow(this.props.bu, nextProps.bu);

            return shouldUpdate;
        }

        render() {
            let drawPausedComponent: boolean = this.props.drawPausedComponent;
            let drawZeroDataFlowComponent = this.props.drawZeroDataFlowComponent;
            let drawStaleSnapshot = this.props.drawStaleSnapshot;

            let oddRow: boolean  = this.props.oddRow;

            let bu: DAQAggregatorSnapshot.BU = this.props.bu;
            let buUrl: string = 'http://' + bu.hostname + ':'+bu.port+'/urn:xdaq-application:service=bu';
            let buState: string  = '';
            let buStateClass = 'fff-table-bu-state-normal';

            if (bu.stateName){

                buState = bu.stateName;

                if (buState === 'Halted' || buState === 'Ready' || buState === 'Enabled' || buState === 'unknown' || buState === ''){
                    buState = '';
                }else{
                    buStateClass = 'fff-table-bu-state-warn';
                }

                if (buState === 'Failed' || buState === 'Error'){
                    buStateClass = 'fff-table-bu-state-error';
                }
            }

            let buJobCrashStateDisplay: string = "";
            let buJobCrashStateDisplayClass: string = "";
            if (bu.crashed){
                buJobCrashStateDisplay = "JobCrash";
                buJobCrashStateDisplayClass = "fff-table-jobcrash";
            }

            let hostname: string = bu.hostname.split(".")[0];

            let buUrlDisplay: any = hostname;
            let buUrlDisplayClass: string = "fff-table-stale-member-wrapbox"; //assume stale and overwrite if not
            let buDebug: string = "Check problems with BU flashlist!";

            if (bu.port > 0){
                buUrlDisplay = <a href={buUrl} target="_blank">{hostname}</a>;
                buUrlDisplayClass = "";
                buDebug = "";
            }

            let rate: number = FormatUtility.toFixedNumber(bu.rate / 1000, 3);
            let throughput: number = FormatUtility.toFixedNumber(bu.throughput / 1000 / 1000, 1);
            let sizeMean: number = FormatUtility.toFixedNumber(bu.eventSizeMean / 1000, 1);
            let sizeStddev: number = FormatUtility.toFixedNumber(bu.eventSizeStddev / 1000, 1);
            let events: number = bu.numEvents;
            let eventsInBU: number = bu.numEventsInBU;

            let requestsSent: number = bu.numRequestsSent;
            let requestsUsed: number = bu.numRequestsUsed;
            let requestsBlocked: number = bu.numRequestsBlocked;

            let fffBuRowClass: string = drawPausedComponent? "fff-table-bu-row-paused" : "fff-table-bu-row-running";

            if (drawZeroDataFlowComponent){
                fffBuRowClass = "fff-table-bu-row-ratezero";
            }

            let eventsInBuClass: string = FormatUtility.getClassNameForNumber(eventsInBU!=null?eventsInBU:0, FFFTableNumberFormats.EVENTS_IN_BU);
            let priorityClass: string = FormatUtility.getClassNameForNumber(bu.priority!=null?bu.priority:0, FFFTableNumberFormats.PRIORITY)
            let requestsSentClass: string = FormatUtility.getClassNameForNumber(requestsSent!=null?requestsSent:0, FFFTableNumberFormats.REQUESTS_SENT);
            let requestsUsedClass: string = FormatUtility.getClassNameForNumber(requestsUsed!=null?requestsUsed:0, FFFTableNumberFormats.REQUESTS_USED);
            let requestsBlockedClass: string = FormatUtility.getClassNameForNumber(requestsBlocked!=null?requestsBlocked:0, FFFTableNumberFormats.REQUESTS_BLOCKED);

            //invert color when DAQ is stuck, because red colors are missed
            if (drawZeroDataFlowComponent && oddRow) {

                let escapeRedField: string = 'fff-table-bu-red-column-escape';

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

            if (drawStaleSnapshot && (!drawPausedComponent)){
                fffBuRowClass = 'fff-table-bu-row-stale-page-row';
            }

            return (
                <tr className={fffBuRowClass}>
                    <td><div title={buDebug} className={buUrlDisplayClass}>{buUrlDisplay}</div></td>
                    <td>
                        <div className={buStateClass}>{buState}</div>
                        <div className={buJobCrashStateDisplayClass}>{buJobCrashStateDisplay}</div>
                    </td>
                    <td className={classNames("fff-table-bu-row-counter",FormatUtility.getClassNameForNumber(rate!=null?rate:0, FFFTableNumberFormats.RATE))}>{rate!=null?rate.toFixed(3):'*'}</td>
                    <td className={classNames("fff-table-bu-row-counter",FormatUtility.getClassNameForNumber(throughput!=null?throughput:0, FFFTableNumberFormats.THROUGHPUT))}>{throughput!=null?throughput.toFixed(1):'*'}</td>
                    <td className={classNames("fff-table-bu-row-counter",FormatUtility.getClassNameForNumber(sizeMean!=null?sizeMean:0, FFFTableNumberFormats.SIZE))}>{sizeMean!=null?sizeMean.toFixed(1):'*'}±{sizeStddev!=null?sizeStddev.toFixed(1):'*'}</td>
                    <td className={classNames("fff-table-bu-row-counter",FormatUtility.getClassNameForNumber(events!=null?events:0, FFFTableNumberFormats.EVENTS))}>{events!=null?events:'*'}</td>
                    <td className={classNames("fff-table-bu-row-counter",eventsInBuClass)}>{eventsInBU!=null? eventsInBU:'*'}</td>
                    <td><div className={classNames("fff-table-bu-row-counter",priorityClass)}>{bu.priority!=null?bu.priority:'*'}</div></td>
                    <td className={classNames("fff-table-bu-row-counter",requestsSentClass)}>{requestsSent!=null?requestsSent:'*'}</td>
                    <td className={classNames("fff-table-bu-row-counter",requestsUsedClass)}>{requestsUsed!=null?requestsUsed:'*'}</td>
                    <td><div className={classNames("fff-table-bu-row-counter",requestsBlockedClass)}>{requestsBlocked!=null?requestsBlocked:'*'}</div></td>
                    <td className="fff-table-bu-row-counter">{bu.numFUsHLT!=null?bu.numFUsHLT:'*'}</td>
                    <td className="fff-table-bu-row-counter">{bu.numFUsCrashed!=null?bu.numFUsCrashed:'*'}</td>
                    <td className="fff-table-bu-row-counter">{bu.numFUsStale!=null?bu.numFUsStale:'*'}</td>
                    <td className="fff-table-bu-row-counter">{bu.numFUsCloud!=null?bu.numFUsCloud:'*'}</td>
                    <td className="fff-table-bu-row-counter">{bu.ramDiskUsage!=null?(bu.ramDiskUsage).toFixed(1):'*'}% of {bu.ramDiskTotal!=null?bu.ramDiskTotal.toFixed(1):'*'}GB</td>
                    <td className="fff-table-bu-row-counter">{bu.numFiles!=null?bu.numFiles:'*'}</td>
                    <td className="fff-table-bu-row-counter">{bu.numLumisectionsWithFiles!=null?bu.numLumisectionsWithFiles:'*'}</td>
                    <td className="fff-table-bu-row-counter">{bu.currentLumisection!=null?bu.currentLumisection:'*'}</td>
                    <td className="fff-table-bu-row-counter">{bu.numLumisectionsForHLT!=null?bu.numLumisectionsForHLT:'*'}</td>
                    <td className="fff-table-bu-row-counter">{bu.numLumisectionsOutHLT!=null?bu.numLumisectionsOutHLT:'*'}</td>
                    <td className={classNames("fff-table-bu-row-counter",FormatUtility.getClassNameForNumber(bu.fuOutputBandwidthInMB!=null?bu.fuOutputBandwidthInMB:0, FFFTableNumberFormats.BANDWIDTH))}>{bu.fuOutputBandwidthInMB!=null?bu.fuOutputBandwidthInMB.toFixed(2):'*'}</td>

                </tr>
            );
        }
    }

    interface FileBasedFilterFarmTableBUSummaryRowProperties {
        numBus: number;
        numBusNoRate: number;
        buSummary: DAQAggregatorSnapshot.BUSummary;
        drawPausedComponent: boolean;
        drawZeroDataFlowComponent: boolean;
        drawStaleSnapshot: boolean;
    }

    class FileBasedFilterFarmTableBUSummaryRow extends React.Component<FileBasedFilterFarmTableBUSummaryRowProperties,{}> {
        shouldComponentUpdate(nextProps: FileBasedFilterFarmTableBUSummaryRowProperties) {
            let shouldUpdate: boolean = false;

            shouldUpdate = shouldUpdate || this.props.numBus !== nextProps.numBus;
            shouldUpdate = shouldUpdate || this.props.numBusNoRate !== nextProps.numBusNoRate;
            shouldUpdate = shouldUpdate || this.props.drawPausedComponent !== nextProps.drawPausedComponent;
            shouldUpdate = shouldUpdate || this.props.drawZeroDataFlowComponent !== nextProps.drawZeroDataFlowComponent;
            shouldUpdate = shouldUpdate || this.props.drawStaleSnapshot !== nextProps.drawStaleSnapshot;
            shouldUpdate = shouldUpdate || !DAQViewUtility.snapshotElementsEqualShallow(this.props.buSummary, nextProps.buSummary);

            return shouldUpdate;
        }

        render() {
            let buSummary: DAQAggregatorSnapshot.BUSummary = this.props.buSummary;
            let drawPausedComponent: boolean = this.props.drawPausedComponent;
            let drawZeroDataFlowComponent = this.props.drawZeroDataFlowComponent;
            let drawStaleSnapshot = this.props.drawStaleSnapshot;
            let fffBuSummaryRowClass: string = drawPausedComponent ? "fff-table-bu-summary-row-paused" : "fff-table-bu-summary-row-running";


            let eventsInBuClass: string = FormatUtility.getClassNameForNumber(buSummary.numEventsInBU!=null? buSummary.numEventsInBU : 0, FFFTableNumberFormats.EVENTS_IN_BU);
            let requestsSentClass: string = FormatUtility.getClassNameForNumber(buSummary.numRequestsSent!=null? buSummary.numRequestsSent : 0, FFFTableNumberFormats.REQUESTS_SENT);
            let requestsUsedClass: string = FormatUtility.getClassNameForNumber(buSummary.numRequestsUsed!=null? buSummary.numRequestsUsed : 0, FFFTableNumberFormats.REQUESTS_USED);
            let requestsBlockedClass: string = 'fff-table-requests-blocked';

            if (drawZeroDataFlowComponent){
                fffBuSummaryRowClass = "fff-table-bu-summary-row-ratezero";

                if (!drawStaleSnapshot) {
                    let escapeRedField: string = 'fff-table-bu-red-column-escape';

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


            if (drawStaleSnapshot && (!drawPausedComponent)){
                fffBuSummaryRowClass = 'fff-table-bu-summary-row-stale-page';
            }





            return (
                <tr className={classNames(fffBuSummaryRowClass, "fff-table-bu-row-counter")}>
                    <td>Σ BUs = {this.props.numBusNoRate} / {this.props.numBus}</td>
                    <td></td>
                    <td className={FormatUtility.getClassNameForNumber(buSummary.rate!=null ? buSummary.rate / 1000 : 0, FFFTableNumberFormats.RATE)}>Σ {buSummary.rate!=null ? (buSummary.rate / 1000).toFixed(3) : '*'}</td>
                    <td className={FormatUtility.getClassNameForNumber(buSummary.throughput!=null ? buSummary.throughput / 1000 / 1000 : 0, FFFTableNumberFormats.THROUGHPUT)}>Σ {buSummary.throughput!=null ? (buSummary.throughput / 1000 / 1000).toFixed(1) : '*'}</td>
                    <td className={FormatUtility.getClassNameForNumber(buSummary.eventSizeMean!=null ? buSummary.eventSizeMean / 1000 : 0, FFFTableNumberFormats.SIZE)}>{buSummary.eventSizeMean!=null?(buSummary.eventSizeMean / 1000).toFixed(1):'*'}±{buSummary.eventSizeStddev!=null? (buSummary.eventSizeStddev / 1000).toFixed(1) :'*'}</td>
                    <td className={FormatUtility.getClassNameForNumber(buSummary.numEvents!=null ? buSummary.numEvents : 0, FFFTableNumberFormats.EVENTS)}>Σ {buSummary.numEvents!=null?buSummary.numEvents:'*'}</td>
                    <td className={eventsInBuClass}>Σ {buSummary.numEventsInBU!=null?buSummary.numEventsInBU:'*'}</td>
                    <td className="fff-table-priority">{buSummary.priority!=null?buSummary.priority:'*'}</td>
                    <td className={requestsSentClass}>Σ {buSummary.numRequestsSent!=null?buSummary.numRequestsSent:'*'}</td>
                    <td className={requestsUsedClass}>Σ {buSummary.numRequestsUsed!=null?buSummary.numRequestsUsed:'*'}</td>
                    <td className={requestsBlockedClass}>Σ {buSummary.numRequestsBlocked!=null?buSummary.numRequestsBlocked:'*'}</td>
                    <td>Σ {buSummary.numFUsHLT!=null?buSummary.numFUsHLT:'*'}</td>
                    <td>Σ {buSummary.numFUsCrashed!=null?buSummary.numFUsCrashed:'*'}</td>
                    <td>Σ {buSummary.numFUsStale!=null?buSummary.numFUsStale:'*'}</td>
                    <td>Σ {buSummary.numFUsCloud!=null?buSummary.numFUsCloud:'*'}</td>
                    <td>Σ {buSummary.ramDiskUsage!=null?buSummary.ramDiskUsage.toFixed(1):'*'}% of {buSummary.ramDiskTotal!=null?buSummary.ramDiskTotal.toFixed(1):'*'}GB</td>
                    <td>Σ {buSummary.numFiles!=null?buSummary.numFiles:'*'}</td>
                    <td>{buSummary.numLumisectionsWithFiles!=null?buSummary.numLumisectionsWithFiles:'*'}</td>
                    <td>{buSummary.currentLumisection!=null?buSummary.currentLumisection:'*'}</td>
                    <td>{buSummary.numLumisectionsForHLT!=null?buSummary.numLumisectionsForHLT:'*'}</td>
                    <td>{buSummary.numLumisectionsOutHLT!=null?buSummary.numLumisectionsOutHLT:'*'}</td>
                    <td>{buSummary.fuOutputBandwidthInMB!=null?buSummary.fuOutputBandwidthInMB.toFixed(2):'*'}</td>
                </tr>
            );
        }
    }
}