///<reference path="../../structures/daq-aggregator/da-snapshot.ts"/>
///<reference path="../daq-snapshot-view/daq-snapshot-view.d.ts"/>

///<reference path="../../utilities/format-util.ts"/>

namespace DAQView {

    import DAQAggregatorSnapshot = DAQAggregator.Snapshot;
    import DAQ = DAQAggregator.Snapshot.DAQ;

    export class FileBasedFilterFarmTable implements DAQView.DAQSnapshotView {
        public htmlRootElement: Element;

        private snapshot: DAQAggregatorSnapshot;
        private sortFunction: (snapshot: DAQAggregatorSnapshot) => DAQAggregatorSnapshot = FFFTableSortFunctions.NONE;

        private currentSorting: {[key: string]: Sorting} = {
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
            '#LS w/ files': Sorting.None,
            'current LS': Sorting.None,
            '#LS for HLT': Sorting.None,
            '#LS out HLT': Sorting.None,
            'b/w out (MB/s)': Sorting.None
        };

        constructor(htmlRootElementName: string) {
            this.htmlRootElement = document.getElementById(htmlRootElementName);
        }

        public setSnapshot(snapshot: DAQAggregatorSnapshot) {
            this.snapshot = snapshot;
            let sortedSnapshot: DAQAggregatorSnapshot = this.sort(snapshot);
            let daq: DAQAggregatorSnapshot.DAQ = sortedSnapshot.getDAQ();
            let fileBasedFilterFarmTableRootElement: any = <FileBasedFilterFarmTableElement tableObject={this}
                                                                                            bus={daq.bus}
                                                                                            buSummary={daq.buSummary}/>;
            ReactDOM.render(fileBasedFilterFarmTableRootElement, this.htmlRootElement);
        }

        public setSortFunction(sortFunction: (snapshot: DAQAggregatorSnapshot) => DAQAggregatorSnapshot) {
            this.sortFunction = sortFunction;
            this.setSnapshot(this.snapshot);
        }

        public sort(snapshot: DAQAggregatorSnapshot): DAQAggregatorSnapshot {
            return this.sortFunction(snapshot);
        }

        public setCurrentSorting(headerName: string, sorting: Sorting) {
            DAQViewUtility.forEachOwnObjectProperty(this.currentSorting, (header: string) => this.currentSorting[header] = Sorting.None);
            this.currentSorting[headerName] = sorting;
        }

        public getCurrentSorting(headerName: string) {
            return this.currentSorting[headerName];
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
    }

    interface FileBasedFilterFarmTableElementProperties {
        tableObject: FileBasedFilterFarmTable;
        bus: DAQAggregatorSnapshot.BU[];
        buSummary: DAQAggregatorSnapshot.BUSummary;
    }

    class FileBasedFilterFarmTableElement extends React.Component<FileBasedFilterFarmTableElementProperties,{}> {
        render() {
            let tableObject: FileBasedFilterFarmTable = this.props.tableObject;
            let baseHeaders: FileBasedFilterFarmTableHeaderProperties[] = [
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

            let topHeaders: FileBasedFilterFarmTableHeaderProperties[] = baseHeaders.slice();
            topHeaders.unshift(
                {
                    content: 'BU',
                    tableObject: tableObject,
                    sortFunctions: {
                        Ascending: FFFTableSortFunctions.BU_HOSTNAME_ASC,
                        Descending: FFFTableSortFunctions.BU_HOSTNAME_DESC
                    }
                }
            );

            let summaryHeaders: FileBasedFilterFarmTableHeaderProperties[] = baseHeaders.slice();
            summaryHeaders.unshift({content: 'Summary'});

            let buSummary: DAQAggregatorSnapshot.BUSummary = this.props.buSummary;
            let bus: DAQAggregatorSnapshot.BU[] = this.props.bus;
            let numBus: number = 0;
            let buRows: any[] = [];
            if (bus) {
                numBus = bus.length;
                bus.forEach(bu => buRows.push(<FileBasedFilterFarmTableBURow bu={bu}/>));
            }

            return (
                <table className="fff-table">
                    <thead className="fff-table-head">
                    <FileBasedFilterFarmTableTopHeaderRow />
                    <FileBasedFilterFarmTableHeaderRow headers={topHeaders}/>
                    </thead>
                    <tbody className="fff-table-body">
                    {buRows}
                    <FileBasedFilterFarmTableHeaderRow headers={summaryHeaders}/>
                    <FileBasedFilterFarmTableBUSummaryRow buSummary={buSummary} numBus={numBus}/>
                    </tbody>
                </table>
            );
        }
    }

    class FileBasedFilterFarmTableTopHeaderRow extends React.Component<{},{}> {
        render() {
            return (
                <tr className="fff-table-top-header-row">
                    <FileBasedFilterFarmTableHeader additionalClasses="fff-table-help"
                                                    content={<a href=".">Table Help</a>} colSpan="2"/>
                    <FileBasedFilterFarmTableHeader content="B U I L D E R   U N I T   ( B U )" colSpan="19"/>
                </tr>
            );
        }
    }

    interface FileBasedFilterFarmTableHeaderRowProperties {
        headers: FileBasedFilterFarmTableHeaderProperties[];
    }

    class FileBasedFilterFarmTableHeaderRow extends React.Component<FileBasedFilterFarmTableHeaderRowProperties,{}> {
        render() {
            let children: any[] = [];
            this.props.headers.forEach(header => children.push(<FileBasedFilterFarmTableHeader content={header.content}
                                                                                               colSpan={header.colSpan}
                                                                                               additionalClasses={header.additionalClasses}
                                                                                               tableObject={header.tableObject}
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
        sortFunctions?: { [key: string]: ((snapshot: DAQAggregatorSnapshot) => DAQAggregatorSnapshot) };
    }

    class FileBasedFilterFarmTableHeader extends React.Component<FileBasedFilterFarmTableHeaderProperties,{}> {
        render() {
            let content: string = this.props.content;
            let colSpan: string = this.props.colSpan;
            let additionalClasses: string | string[] = this.props.additionalClasses;
            let className: string = classNames("fff-table-header", additionalClasses);

            let tableObject: FileBasedFilterFarmTable = this.props.tableObject;
            let currentSorting: Sorting;
            let sortFunctions: { [key: string]: ((snapshot: DAQAggregatorSnapshot) => DAQAggregatorSnapshot) } = this.props.sortFunctions;
            if (tableObject && sortFunctions) {
                currentSorting = tableObject.getCurrentSorting(content);
            }

            let clickFunction: () => void = null;
            if (tableObject && sortFunctions) {
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
            if (currentSorting) {
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
    }

    class FileBasedFilterFarmTableBURow extends React.Component<FileBasedFilterFarmTableBURowProperties,{}> {
        render() {
            let bu: DAQAggregatorSnapshot.BU = this.props.bu;
            let buUrl: string = 'http://' + bu.hostname + ':11100/urn:xdaq-application:service=bu';

            let hostname: string = bu.hostname.substring(0, bu.hostname.length - 4);
            let rate: number = FormatUtility.toFixedNumber(bu.rate / 1000, 3);
            let throughput: number = FormatUtility.toFixedNumber(bu.throughput / 1024 / 1024, 1);
            let sizeMean: number = FormatUtility.toFixedNumber(bu.eventSizeMean / 1024, 1);
            let sizeStddev: number = FormatUtility.toFixedNumber(bu.eventSizeStddev / 1024, 1);
            let events: number = bu.numEvents;
            let eventsInBU: number = bu.numEventsInBU;

            let requestsSent: number = bu.numRequestsSent;
            let requestsUsed: number = bu.numRequestsUsed;
            let requestsBlocked: number = bu.numRequestsBlocked;

            bu.fuOutputBandwidthInMB = 0;

            return (
                <tr className="fff-table-bu-row">
                    <td><a href={buUrl} target="_blank">{hostname}</a></td>
                    <td className={FormatUtility.getClassNameForNumber(rate, FFFTableNumberFormats.RATE)}>{rate}</td>
                    <td className={FormatUtility.getClassNameForNumber(throughput, FFFTableNumberFormats.THROUGHPUT)}>{throughput}</td>
                    <td className={FormatUtility.getClassNameForNumber(sizeMean, FFFTableNumberFormats.SIZE)}>{sizeMean}±{sizeStddev}</td>
                    <td className={FormatUtility.getClassNameForNumber(events, FFFTableNumberFormats.EVENTS)}>{events}</td>
                    <td className={FormatUtility.getClassNameForNumber(eventsInBU, FFFTableNumberFormats.EVENTS_IN_BU)}>{eventsInBU}</td>
                    <td>{bu.priority}</td>
                    <td className={FormatUtility.getClassNameForNumber(requestsSent, FFFTableNumberFormats.REQUESTS_SENT)}>{requestsSent}</td>
                    <td className={FormatUtility.getClassNameForNumber(requestsUsed, FFFTableNumberFormats.REQUESTS_USED)}>{requestsUsed}</td>
                    <td className={FormatUtility.getClassNameForNumber(requestsBlocked, FFFTableNumberFormats.REQUESTS_BLOCKED)}>{requestsBlocked}</td>
                    <td>{bu.numFUsHLT}</td>
                    <td>{bu.numFUsCrashed}</td>
                    <td>{bu.numFUsStale}</td>
                    <td>{bu.numFUsCloud}</td>
                    <td>{bu.ramDiskUsage.toFixed(1)}% of {bu.ramDiskTotal.toFixed(1)}GB</td>
                    <td>{bu.numFiles}</td>
                    <td>{bu.numLumisectionsWithFiles}</td>
                    <td>{bu.currentLumisection}</td>
                    <td>{bu.numLumisectionsForHLT}</td>
                    <td>{bu.numLumisectionsOutHLT}</td>
                    <td>{bu.fuOutputBandwidthInMB.toFixed(1)}</td>
                </tr>
            );
        }
    }

    interface FileBasedFilterFarmTableBUSummaryRowProperties {
        numBus: number;
        buSummary: DAQAggregatorSnapshot.BUSummary;
    }

    class FileBasedFilterFarmTableBUSummaryRow extends React.Component<FileBasedFilterFarmTableBUSummaryRowProperties,{}> {
        render() {
            let buSummary: DAQAggregatorSnapshot.BUSummary = this.props.buSummary;

            buSummary.fuOutputBandwidthInMB = 0;

            return (
                <tr className="fff-table-bu-summary-row">
                    <td>Σ BUs = x / {this.props.numBus}</td>
                    <td>Σ {(buSummary.rate / 1000).toFixed(3)}</td>
                    <td>Σ {(buSummary.throughput / 1024 / 1024).toFixed(1)}</td>
                    <td>{(buSummary.eventSizeMean / 1024).toFixed(1)}±{(buSummary.eventSizeStddev / 1024).toFixed(1)}</td>
                    <td>Σ {buSummary.numEvents}</td>
                    <td>Σ {buSummary.numEventsInBU}</td>
                    <td>{buSummary.priority}</td>
                    <td>Σ {buSummary.numRequestsSent}</td>
                    <td>Σ {buSummary.numRequestsUsed}</td>
                    <td>Σ {buSummary.numRequestsBlocked}</td>
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
                    <td>{buSummary.fuOutputBandwidthInMB.toFixed(1)}</td>
                </tr>
            );
        }
    }

}