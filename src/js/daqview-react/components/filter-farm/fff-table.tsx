/**
 * @author Michail Vougioukas
 * @author Philipp Brummer
 */

///<reference path="../../structures/daq-aggregator/daq-snapshot.ts"/>
///<reference path="../daq-snapshot-view/daq-snapshot-view.d.ts"/>

///<reference path="../../utilities/format-util.ts"/>

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

        constructor(htmlRootElementName: string) {
            this.htmlRootElement = document.getElementById(htmlRootElementName);
        }

        public setSnapshot(snapshot: DAQAggregatorSnapshot, drawPausedComponent: boolean, drawZeroDataFlowComponent:boolean, url:string) {
            if (!snapshot){
                let msg: string = "";
                let errRootElement: any = <ErrorElement message={msg}/>;
                ReactDOM.render(errRootElement, this.htmlRootElement);
            }else {
                if (this.snapshot != null && this.snapshot.getUpdateTimestamp() === snapshot.getUpdateTimestamp()) {
                    console.log("duplicate snapshot detected");
                    if (drawPausedComponent || drawZeroDataFlowComponent) {
                        console.log("...but page color has to change, so do render");
                    } else {
                        return;
                    }
                }
                this.snapshot = snapshot;
                this.drawPausedComponent = drawPausedComponent;
                this.drawZeroDataFlowComponent = drawZeroDataFlowComponent;
                this.updateSnapshot();
            }
        }

        private updateSnapshot() {
            let sortedSnapshot: DAQAggregatorSnapshot = this.sort(this.snapshot);
            let daq: DAQAggregatorSnapshot.DAQ = sortedSnapshot.getDAQ();
            let drawPausedComponent: boolean = this.drawPausedComponent;
            let drawZeroDataFlowComponent: boolean = this.drawZeroDataFlowComponent;
            let fileBasedFilterFarmTableRootElement: any = <FileBasedFilterFarmTableElement tableObject={this}
                                                                                            bus={daq.bus}
                                                                                            buSummary={daq.buSummary}
                                                                                            drawPausedComponent={drawPausedComponent}
                                                                                            drawZeroDataFlowComponent={drawZeroDataFlowComponent}/>;
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
            baseStyle: 'fff-table-requests-blocked'
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
    }

    class FileBasedFilterFarmTableElement extends React.Component<FileBasedFilterFarmTableElementProperties,{}> {

        render() {
            let buSummary: DAQAggregatorSnapshot.BUSummary = this.props.buSummary;
            let bus: DAQAggregatorSnapshot.BU[] = this.props.bus;
            let numBus: number = 0;

            let drawPausedComponents: boolean = this.props.drawPausedComponent;
            let drawZeroDataFlowComponents: boolean = this.props.drawZeroDataFlowComponent;
            let buRows: any[] = [];
            if (bus != null) {
                numBus = bus.length;
                bus.forEach( function (bu){
                    let index: number = buRows.length;
                    let oddRow: boolean = (index % 2 == 1)? true : false;

                    buRows.push(<FileBasedFilterFarmTableBURow key={bu['@id']} bu={bu} drawPausedComponent={drawPausedComponents} drawZeroDataFlowComponent={drawZeroDataFlowComponents} oddRow={oddRow}/>);
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
                    <FileBasedFilterFarmTableBUSummaryRow key="fff-summary-row" buSummary={buSummary} numBus={numBus} numBusNoRate={numBusNoRate} drawPausedComponent={drawPausedComponents} drawZeroDataFlowComponent={drawZeroDataFlowComponents}/>
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
                                                    content={<a href="ffftablehelp.html" target="_blank">Table Help</a>} colSpan="2" drawPausedComponent={drawPausedComponent}/>
                    <FileBasedFilterFarmTableHeader content="B U I L D E R   U N I T   ( B U )" colSpan="20" drawPausedComponent={drawPausedComponent}/>
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
        colSpan?: string;
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
            let colSpan: string = this.props.colSpan;
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
                <th className={className} colSpan={colSpan ? colSpan : "1"}>
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
    }

    class FileBasedFilterFarmTableBURow extends React.Component<FileBasedFilterFarmTableBURowProperties,{}> {
        shouldComponentUpdate(nextProps: FileBasedFilterFarmTableBURowProperties) {
            return true; //this can be optimized
            //return !DAQViewUtility.snapshotElementsEqualShallow(this.props.bu, nextProps.bu);
        }

        render() {
            let drawPausedComponent: boolean = this.props.drawPausedComponent;
            let drawZeroDataFlowComponent = this.props.drawZeroDataFlowComponent;

            let oddRow: boolean  = this.props.oddRow;

            let bu: DAQAggregatorSnapshot.BU = this.props.bu;
            let buUrl: string = 'http://' + bu.hostname + ':'+bu.port+'/urn:xdaq-application:service=bu';

            let buState: string  = '';
            let buStateClass = 'fff-table-bu-state-normal';

            if (bu.stateName){

                buState = bu.stateName;

                if (buState === 'Halted' || buState === 'Ready' || buState === 'Enabled' || buState === ''){
                    buState = '';
                }else{
                    buStateClass = 'fff-table-bu-state-warn';
                }

                if (buState === 'Failed' || buState === 'Error'){
                    buStateClass = 'fff-table-bu-state-error';
                }
            }


            let hostname: string = bu.hostname.split(".")[0];
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

            let eventsInBuClass: string = FormatUtility.getClassNameForNumber(eventsInBU, FFFTableNumberFormats.EVENTS_IN_BU);
            let requestsSentClass: string = FormatUtility.getClassNameForNumber(requestsSent, FFFTableNumberFormats.REQUESTS_SENT);
            let requestsUsedClass: string = FormatUtility.getClassNameForNumber(requestsUsed, FFFTableNumberFormats.REQUESTS_USED);
            let requestsBlockedClass: string = FormatUtility.getClassNameForNumber(requestsBlocked, FFFTableNumberFormats.REQUESTS_BLOCKED);

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

            return (
                <tr className={fffBuRowClass}>
                    <td><a href={buUrl} target="_blank">{hostname}</a></td>
                    <td className={buStateClass}>{buState}</td>
                    <td className={classNames("fff-table-bu-row-counter",FormatUtility.getClassNameForNumber(rate, FFFTableNumberFormats.RATE))}>{rate.toFixed(3)}</td>
                    <td className={classNames("fff-table-bu-row-counter",FormatUtility.getClassNameForNumber(throughput, FFFTableNumberFormats.THROUGHPUT))}>{throughput.toFixed(1)}</td>
                    <td className={classNames("fff-table-bu-row-counter",FormatUtility.getClassNameForNumber(sizeMean, FFFTableNumberFormats.SIZE))}>{sizeMean.toFixed(3)}±{sizeStddev.toFixed(3)}</td>
                    <td className={classNames("fff-table-bu-row-counter",FormatUtility.getClassNameForNumber(events, FFFTableNumberFormats.EVENTS))}>{events}</td>
                    <td className={classNames("fff-table-bu-row-counter",eventsInBuClass)}>{eventsInBU}</td>
                    <td className="fff-table-bu-row-counter">{bu.priority}</td>
                    <td className={classNames("fff-table-bu-row-counter",requestsSentClass)}>{requestsSent}</td>
                    <td className={classNames("fff-table-bu-row-counter",requestsUsedClass)}>{requestsUsed}</td>
                    <td className={classNames("fff-table-bu-row-counter",requestsBlockedClass)}>{requestsBlocked}</td>
                    <td className="fff-table-bu-row-counter">{bu.numFUsHLT}</td>
                    <td className="fff-table-bu-row-counter">{bu.numFUsCrashed}</td>
                    <td className="fff-table-bu-row-counter">{bu.numFUsStale}</td>
                    <td className="fff-table-bu-row-counter">{bu.numFUsCloud}</td>
                    <td className="fff-table-bu-row-counter">{(bu.ramDiskUsage).toFixed(1)}% of {bu.ramDiskTotal.toFixed(1)}GB</td>
                    <td className="fff-table-bu-row-counter">{bu.numFiles}</td>
                    <td className="fff-table-bu-row-counter">{bu.numLumisectionsWithFiles}</td>
                    <td className="fff-table-bu-row-counter">{bu.currentLumisection}</td>
                    <td className="fff-table-bu-row-counter">{bu.numLumisectionsForHLT}</td>
                    <td className="fff-table-bu-row-counter">{bu.numLumisectionsOutHLT}</td>
                    <td className={classNames("fff-table-bu-row-counter",FormatUtility.getClassNameForNumber(bu.fuOutputBandwidthInMB, FFFTableNumberFormats.BANDWIDTH))}>{bu.fuOutputBandwidthInMB.toFixed(2)}</td>

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
    }

    class FileBasedFilterFarmTableBUSummaryRow extends React.Component<FileBasedFilterFarmTableBUSummaryRowProperties,{}> {
        shouldComponentUpdate(nextProps: FileBasedFilterFarmTableBUSummaryRowProperties) {
            return true; //this can be optimized
            //return (this.props.numBus != nextProps.numBus) || (!DAQViewUtility.snapshotElementsEqualShallow(this.props.buSummary, nextProps.buSummary));
        }

        render() {
            let buSummary: DAQAggregatorSnapshot.BUSummary = this.props.buSummary;
            let drawPausedComponent: boolean = this.props.drawPausedComponent;
            let drawZeroDataFlowComponent = this.props.drawZeroDataFlowComponent;
            let fffBuSummaryRowClass: string = drawPausedComponent ? "fff-table-bu-summary-row-paused" : "fff-table-bu-summary-row-running";


            let eventsInBuClass: string = FormatUtility.getClassNameForNumber(buSummary.numEventsInBU, FFFTableNumberFormats.EVENTS_IN_BU);
            let requestsSentClass: string = FormatUtility.getClassNameForNumber(buSummary.numRequestsSent, FFFTableNumberFormats.REQUESTS_SENT);
            let requestsUsedClass: string = FormatUtility.getClassNameForNumber(buSummary.numRequestsUsed, FFFTableNumberFormats.REQUESTS_USED);
            let requestsBlockedClass: string = FormatUtility.getClassNameForNumber(buSummary.numRequestsBlocked, FFFTableNumberFormats.REQUESTS_BLOCKED);

            if (drawZeroDataFlowComponent){
                fffBuSummaryRowClass = "fff-table-bu-summary-row-ratezero";

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

            return (
                <tr className={classNames(fffBuSummaryRowClass, "fff-table-bu-row-counter")}>
                    <td>Σ BUs = {this.props.numBusNoRate} / {this.props.numBus}</td>
                    <td></td>
                    <td className={FormatUtility.getClassNameForNumber(buSummary.rate / 1000, FFFTableNumberFormats.RATE)}>Σ {(buSummary.rate / 1000).toFixed(3)}</td>
                    <td className={FormatUtility.getClassNameForNumber(buSummary.throughput / 1000 / 1000, FFFTableNumberFormats.THROUGHPUT)}>Σ {(buSummary.throughput / 1000 / 1000).toFixed(1)}</td>
                    <td className={FormatUtility.getClassNameForNumber(buSummary.eventSizeMean / 1000, FFFTableNumberFormats.SIZE)}>{(buSummary.eventSizeMean / 1000).toFixed(3)}±{(buSummary.eventSizeStddev / 1000).toFixed(3)}</td>
                    <td className={FormatUtility.getClassNameForNumber(buSummary.numEvents, FFFTableNumberFormats.EVENTS)}>Σ {buSummary.numEvents}</td>
                    <td className={eventsInBuClass}>Σ {buSummary.numEventsInBU}</td>
                    <td>{buSummary.priority}</td>
                    <td className={requestsSentClass}>Σ {buSummary.numRequestsSent}</td>
                    <td className={requestsUsedClass}>Σ {buSummary.numRequestsUsed}</td>
                    <td className={requestsBlockedClass}>Σ {buSummary.numRequestsBlocked}</td>
                    <td>Σ {buSummary.numFUsHLT}</td>
                    <td>Σ {buSummary.numFUsCrashed}</td>
                    <td>Σ {buSummary.numFUsStale}</td>
                    <td>Σ {buSummary.numFUsCloud}</td>
                    <td>Σ {buSummary.ramDiskUsage.toFixed(1)}% of {buSummary.ramDiskTotal.toFixed(1)}GB</td>
                    <td>Σ {buSummary.numFiles}</td>
                    <td>{buSummary.numLumisectionsWithFiles}</td>
                    <td>{buSummary.currentLumisection}</td>
                    <td>{buSummary.numLumisectionsForHLT}</td>
                    <td>{buSummary.numLumisectionsOutHLT}</td>
                    <td>{buSummary.fuOutputBandwidthInMB.toFixed(2)}</td>
                </tr>
            );
        }
    }
}