///<reference path="../../structures/daq-aggregator/da-snapshot.ts"/>
///<reference path="../daq-snapshot-view/daq-snapshot-view.d.ts"/>

///<reference path="../../utilities/format-util.ts"/>

namespace DAQView {

    import DAQAggregatorSnapshot = DAQAggregator.Snapshot;
    import DAQ = DAQAggregator.Snapshot.DAQ;

    export class FEDBuilderTable implements DAQSnapshotView {
        public htmlRootElement: Element;

        private snapshot: DAQAggregatorSnapshot;
        private sortFunction: (snapshot: DAQAggregatorSnapshot) => DAQAggregatorSnapshot = FBTableSortFunctions.TTCP_ASC;

        private currentSorting: {[key: string]: Sorting} = {
            'TTCP': Sorting.Ascending,
            'FB Name': Sorting.None,
            '%W': Sorting.None,
            '%B': Sorting.None,

            'RU': Sorting.None,
            'warn': Sorting.None,
            'rate (kHz)': Sorting.None,
            'thru (MB/s)': Sorting.None,
            'size (kB)': Sorting.None,
            '#events': Sorting.None,
            '#frags in RU': Sorting.None,
            '#evts in RU': Sorting.None,
            '#requests': Sorting.None
        };

        constructor(htmlRootElementName: string) {
            this.htmlRootElement = document.getElementById(htmlRootElementName);
        }

        public setSnapshot(snapshot: DAQAggregatorSnapshot) {
            this.snapshot = snapshot;
            let sortedSnapshot: DAQAggregatorSnapshot = this.sort(snapshot);
            let daq: DAQAggregatorSnapshot.DAQ = sortedSnapshot.getDAQ();
            let fedBuilderTableRootElement: any = <FEDBuilderTableElement tableObject={this}
                                                                          fedBuilders={daq.fedBuilders}
                                                                          fedBuilderSummary={daq.fedBuilderSummary}/>
            ReactDOM.render(fedBuilderTableRootElement, this.htmlRootElement);
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

    export namespace FBTableNumberFormats {

        export const RATE: FormatUtility.NumberFormat = {
            baseStyle: 'fb-table-rate',
            formats: [{min: 0, max: 0, styleSuffix: '-zero'}, {styleSuffix: '-nonzero'}]
        };

        export const THROUGHPUT: FormatUtility.NumberFormat = {
            baseStyle: 'fb-table-throughput',
            formats: [{min: 0, max: 0, styleSuffix: '-zero'}, {styleSuffix: '-nonzero'}]
        };

        export const SIZE: FormatUtility.NumberFormat = {
            baseStyle: 'fb-table-size',
            formats: [{min: 0, max: 0, styleSuffix: '-zero'}, {styleSuffix: '-nonzero'}]
        };

        export const EVENTS: FormatUtility.NumberFormat = {
            baseStyle: 'fb-table-events'
        };

        export const FRAGMENTS_IN_RU: FormatUtility.NumberFormat = {
            baseStyle: 'fb-table-fragments-in-ru'
        };

        export const EVENTS_IN_RU: FormatUtility.NumberFormat = {
            baseStyle: 'fb-table-events-in-ru'
        };

        export const REQUESTS: FormatUtility.NumberFormat = {
            baseStyle: 'fb-table-requests'
        };

    }

    export namespace FBTableSortFunctions {
        export function NONE(snapshot: DAQAggregatorSnapshot): DAQAggregatorSnapshot {
            return snapshot;
        }

        function TTCP(snapshot: DAQAggregatorSnapshot, descending: boolean): DAQAggregatorSnapshot {
            let daq: DAQAggregatorSnapshot.DAQ = snapshot.getDAQ();
            let fedBuilders: DAQAggregatorSnapshot.FEDBuilder[] = daq.fedBuilders;

            // sort the SubFEDBuilders of each FEDBuilder by their TTCP name
            fedBuilders.forEach(function (fedBuilder: DAQAggregatorSnapshot.FEDBuilder) {
                fedBuilder.subFedbuilders.sort(function (firstSubFedBuilder: DAQAggregatorSnapshot.SubFEDBuilder, secondSubFedBuilder: DAQAggregatorSnapshot.SubFEDBuilder) {
                    let firstSubFedBuilderTTCPName: string = firstSubFedBuilder.ttcPartition.name;
                    let secondSubFedBuilderTTCPName: string = secondSubFedBuilder.ttcPartition.name;

                    if (firstSubFedBuilderTTCPName > secondSubFedBuilderTTCPName) {
                        return (descending ? -1 : 1);
                    } else if (firstSubFedBuilderTTCPName < secondSubFedBuilderTTCPName) {
                        return (descending ? 1 : -1);
                    } else {
                        return 0;
                    }
                });
            });

            // sort the FEDBuilders based on their first SubFEDBuilders TTCP name
            fedBuilders.sort(function (firstFedBuilder: DAQAggregatorSnapshot.FEDBuilder, secondFedBuilder: DAQAggregatorSnapshot.FEDBuilder) {
                if (firstFedBuilder.ru.isEVM) {
                    return -1;
                } else if (secondFedBuilder.ru.isEVM) {
                    return 1;
                }

                let firstFedBuilderFirstTTCPName: string = firstFedBuilder.subFedbuilders[0].ttcPartition.name;
                let secondFedBuilderFirstTTCPName: string = secondFedBuilder.subFedbuilders[0].ttcPartition.name;

                if (firstFedBuilderFirstTTCPName > secondFedBuilderFirstTTCPName) {
                    return (descending ? -1 : 1);
                } else if (firstFedBuilderFirstTTCPName < secondFedBuilderFirstTTCPName) {
                    return (descending ? 1 : -1);
                } else {
                    // if the first TTCP name of both FEDBuilders is the same, sort by FEDBuilder name
                    let firstFedBuilderName: string = firstFedBuilder.name;
                    let secondFedBuilderName: string = secondFedBuilder.name;
                    if (firstFedBuilderName > secondFedBuilderName) {
                        return (descending ? -1 : 1);
                    } else if (firstFedBuilderName < secondFedBuilderName) {
                        return (descending ? 1 : -1);
                    } else {
                        return 0;
                    }
                }
            });

            return snapshot;
        }

        export function TTCP_ASC(snapshot: DAQAggregatorSnapshot): DAQAggregatorSnapshot {
            return TTCP(snapshot, false);
        }

        export function TTCP_DESC(snapshot: DAQAggregatorSnapshot): DAQAggregatorSnapshot {
            return TTCP(snapshot, true);
        }

        function FB(snapshot: DAQAggregatorSnapshot, descending: boolean): DAQAggregatorSnapshot {
            let daq: DAQAggregatorSnapshot.DAQ = snapshot.getDAQ();
            let fedBuilders: DAQAggregatorSnapshot.FEDBuilder[] = daq.fedBuilders;

            // sort by FEDBuilder name
            fedBuilders.sort(function (firstFedBuilder: DAQAggregatorSnapshot.FEDBuilder, secondFedBuilder: DAQAggregatorSnapshot.FEDBuilder) {
                if (firstFedBuilder.ru.isEVM) {
                    return -1;
                } else if (secondFedBuilder.ru.isEVM) {
                    return 1;
                }


                let firstFedBuilderName: string = firstFedBuilder.name;
                let secondFedBuilderName: string = secondFedBuilder.name;
                if (firstFedBuilderName > secondFedBuilderName) {
                    return (descending ? -1 : 1);
                } else if (firstFedBuilderName < secondFedBuilderName) {
                    return (descending ? 1 : -1);
                } else {
                    return 0;
                }
            });

            return snapshot;
        }

        export function FB_ASC(snapshot: DAQAggregatorSnapshot): DAQAggregatorSnapshot {
            return FB(snapshot, false);
        }

        export function FB_DESC(snapshot: DAQAggregatorSnapshot): DAQAggregatorSnapshot {
            return FB(snapshot, true);
        }
    }

    interface FEDBuilderTableElementProperties {
        tableObject: FEDBuilderTable;
        fedBuilders: DAQAggregatorSnapshot.FEDBuilder[];
        fedBuilderSummary: DAQAggregatorSnapshot.FEDBuilderSummary;
    }

    class FEDBuilderTableElement extends React.Component<FEDBuilderTableElementProperties,{}> {
        render() {
            let fbRowSubFbRowEvenClassName: string = 'fb-table-subfb-row-even';
            let fbRowSubFbRowOddClassName: string = 'fb-table-subfb-row-odd';
            let evenRow: boolean = false;

            let fedBuilders: DAQAggregatorSnapshot.FEDBuilder[] = this.props.fedBuilders;

            let evmMaxTrg: number = null;
            fedBuilders.forEach(function (fedBuilder) {
                if (fedBuilder.ru && fedBuilder.ru.isEVM) {
                    if (fedBuilder.subFedbuilders && fedBuilder.subFedbuilders.length > 0) {
                        evmMaxTrg = fedBuilder.subFedbuilders[0].maxTrig;
                    }
                }
            });

            let rows: any[] = [];
            fedBuilders.forEach(function (fedBuilder) {
                let subFedBuilders: DAQAggregatorSnapshot.SubFEDBuilder[] = fedBuilder.subFedbuilders;
                let numSubFedBuilders: number = subFedBuilders.length;

                let ru: DAQAggregatorSnapshot.RU = fedBuilder.ru;
                let ruHostname: string = ru.hostname;
                let ruName: string = ruHostname.substring(0, ruHostname.length - 4);
                let ruUrl: string = 'http://' + ruHostname + ':11100/urn:xdaq-application:service=' + (ru.isEVM ? 'evm' : 'ru');

                let fedBuilderData: any[] = [];
                fedBuilderData.push(<td rowSpan={numSubFedBuilders}>{fedBuilder.name}</td>);
                fedBuilderData.push(<td rowSpan={numSubFedBuilders}><a href={ruUrl} target="_blank">{ruName}</a>
                </td>);
                fedBuilderData.push(<RUMessages rowSpan={numSubFedBuilders} infoMessage={ru.infoMsg}
                                                warnMessage={ru.warnMsg}
                                                errorMessage={ru.errorMsg}/>);
                fedBuilderData.push(<td rowSpan={numSubFedBuilders}>{(ru.rate / 1000).toFixed(3)}</td>);
                fedBuilderData.push(<td rowSpan={numSubFedBuilders}>{(ru.throughput / 1024 / 1024).toFixed(1)}</td>);
                fedBuilderData.push(<td
                    rowSpan={numSubFedBuilders}>{(ru.superFragmentSizeMean / 1024).toFixed(1)}±{(ru.superFragmentSizeStddev / 1024).toFixed(1)}</td>);
                fedBuilderData.push(<td rowSpan={numSubFedBuilders}>evts</td>);
                fedBuilderData.push(<td rowSpan={numSubFedBuilders}>{ru.fragmentsInRU}</td>);
                fedBuilderData.push(<td rowSpan={numSubFedBuilders}>{ru.eventsInRU}</td>);
                fedBuilderData.push(<td rowSpan={numSubFedBuilders}>{ru.requests}</td>);

                let rowClassName: string = evenRow ? fbRowSubFbRowEvenClassName : fbRowSubFbRowOddClassName;

                let count: number = 0;
                subFedBuilders.forEach(subFedBuilder => rows.push(<SubFEDBuilderRow evmMaxTrg={evmMaxTrg}
                                                                                    additionalClasses={rowClassName}
                                                                                    subFedBuilder={subFedBuilder}
                                                                                    additionalContent={++count == 1 ? fedBuilderData : null}/>));

                evenRow = !evenRow;
            });

            let baseHeaders: FEDBuilderTableHeaderProperties[] = [
                {content: 'T'},
                {content: '%W'},
                {content: '%B'},
                {content: 'frlpc'},
                {content: 'geoSlot:SrcId      /      TTSOnlyFEDSrcId'},
                {content: 'min Trg'},
                {content: 'max Trg'},
                {
                    content: 'FB Name',
                    sortFunctions: {
                        Ascending: FBTableSortFunctions.FB_ASC,
                        Descending: FBTableSortFunctions.FB_DESC
                    }
                },
                {content: 'RU'},
                {content: 'warn'},
                {content: 'rate (kHz)'},
                {content: 'thru (MB/s)'},
                {content: 'size (kB)'},
                {content: '#events'},
                {content: '#frags in RU'},
                {content: '#evts in RU'},
                {content: '#requests'}
            ];

            let topHeaders: FEDBuilderTableHeaderProperties[] = baseHeaders.slice();
            topHeaders.unshift({
                content: 'TTCP',
                sortFunctions: {
                    Ascending: FBTableSortFunctions.TTCP_ASC,
                    Descending: FBTableSortFunctions.TTCP_DESC
                }
            });

            let summaryHeaders: FEDBuilderTableHeaderProperties[] = baseHeaders.slice();
            summaryHeaders.unshift({content: 'Summary'});

            let fedBuilderSummary: DAQAggregatorSnapshot.FEDBuilderSummary = this.props.fedBuilderSummary;
            let numRus: number = fedBuilders.length;

            let tableObject: FEDBuilderTable = this.props.tableObject;

            return (
                <table className="fb-table">
                    <colgroup className="fb-table-colgroup-fedbuilder" span="9"/>
                    <colgroup className="fb-table-colgroup-evb" span="9"/>
                    <colgroup className="fb-table-colgroup-unknown" span="2"/>
                    <thead className="fb-table-head">
                    <FEDBuilderTableTopHeaderRow />
                    <FEDBuilderTableHeaderRow tableObject={tableObject} headers={topHeaders}/>
                    </thead>
                    <tbody className="fb-table-body">
                    {rows}
                    <FEDBuilderTableHeaderRow tableObject={tableObject} headers={summaryHeaders}/>
                    <FEDBuilderTableSummaryRow fedBuilderSummary={fedBuilderSummary} numRus={numRus}/>
                    </tbody>
                </table>
            );
        }
    }

    class FEDBuilderTableTopHeaderRow extends React.Component<{},{}> {
        render() {
            return (
                <tr className="fb-table-top-header-row">
                    <FEDBuilderTableHeader additionalClasses="fb-table-help" content={<a href=".">Table Help</a>}
                                           colSpan="2"/>
                    <FEDBuilderTableHeader content="F E D B U I L D E R" colSpan="7"/>
                    <FEDBuilderTableHeader content="E V B" colSpan="9"/>
                </tr>
            );
        }
    }

    interface FEDBuilderTableHeaderRowProperties {
        headers: FEDBuilderTableHeaderProperties[];
        tableObject: FEDBuilderTable;
    }

    class FEDBuilderTableHeaderRow extends React.Component<FEDBuilderTableHeaderRowProperties,{}> {
        render() {
            let tableObject: FEDBuilderTable = this.props.tableObject;

            let children: any[] = [];
            this.props.headers.forEach(header => children.push(<FEDBuilderTableHeader content={header.content}
                                                                                      colSpan={header.colSpan}
                                                                                      additionalClasses={header.additionalClasses}
                                                                                      tableObject={tableObject}
                                                                                      sortFunctions={header.sortFunctions}/>));
            return (
                <tr className="fb-table-header-row">
                    {children}
                </tr>
            );
        }
    }

    interface FEDBuilderTableHeaderProperties {
        content: any;
        colSpan?: string;
        additionalClasses?: string | string[];
        tableObject?: FEDBuilderTable;
        sortFunctions?: { [key: string]: ((snapshot: DAQAggregatorSnapshot) => DAQAggregatorSnapshot) };
    }

    class FEDBuilderTableHeader extends React.Component<FEDBuilderTableHeaderProperties,{}> {
        render() {
            let content: string = this.props.content;
            let colSpan: string = this.props.colSpan;
            let additionalClasses: string | string[] = this.props.additionalClasses;
            let className: string = classNames("fb-table-header", additionalClasses);

            let tableObject: FEDBuilderTable = this.props.tableObject;
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
                sortingImage = <input type="image" className="fb-table-sort-image"
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

    interface RUMessagesProperties {
        rowSpan?: number;
        infoMessage: string;
        warnMessage: string;
        errorMessage: string;
    }

    class RUMessages extends React.Component<RUMessagesProperties,{}> {
        render() {
            return (
                <td className="fb-table-ru-messages" rowSpan={this.props.rowSpan ? this.props.rowSpan : 1}>
                    <span className="fb-table-ru-error-message">{this.props.errorMessage}</span>
                    <span className="fb-table-ru-warn-message">{this.props.warnMessage}</span>
                    <span className="fb-table-ru-info-message">{this.props.infoMessage}</span>
                </td>
            );
        }
    }

    interface SubFEDBuilderRowProperties {
        subFedBuilder: DAQAggregatorSnapshot.SubFEDBuilder;
        evmMaxTrg?: number;
        additionalContent?: any[];
        additionalClasses?: string | string[];
    }

    class SubFEDBuilderRow extends React.Component<SubFEDBuilderRowProperties,{}> {
        render() {
            let subFedBuilder: DAQAggregatorSnapshot.SubFEDBuilder = this.props.subFedBuilder;
            let frlPc: DAQAggregatorSnapshot.FRLPc = subFedBuilder.frlPc;
            let frlPcHostname: string = frlPc.hostname;
            let frlPcName: string = frlPcHostname.substring(0, frlPcHostname.length - 4);
            let frlPcUrl: string = 'http://' + frlPcHostname + ':11100';
            let frls: DAQAggregatorSnapshot.FRL[] = subFedBuilder.frls;

            let additionalClasses: string | string[] = this.props.additionalClasses;
            let className: string = classNames("fb-table-subfb-row", additionalClasses);

            let ttcPartition: DAQAggregatorSnapshot.TTCPartition = subFedBuilder.ttcPartition;
            let ttsState: string = ttcPartition.ttsState ? ttcPartition.ttsState.substring(0, 1) : '-';
            let ttsStateClasses: string = ttcPartition.ttsState ? 'fb-table-subfb-tts-state-' + ttsState : 'fb-table-subfb-tts-state-none';
            ttsStateClasses = classNames(ttsStateClasses, 'fb-table-subfb-tts-state');

            let minTrig: number = subFedBuilder.minTrig;
            let maxTrig: number = subFedBuilder.maxTrig;

            let minTrigUnequalMaxTrig: boolean = minTrig != maxTrig;

            let ttcPartitionTTSStateLink: any = ttsState;
            if (ttcPartition.fmm) {
                ttcPartitionTTSStateLink = <a href={ttcPartition.fmm.url} target="_blank">{ttsState}</a>;
            }
            let ttcPartitionTTSStateDisplay: any = <span className={ttsStateClasses}>{ttcPartitionTTSStateLink}</span>;

            let evmMaxTrg: number = this.props.evmMaxTrg;

            let minTrigDisplayContent: any = '';
            let maxTrigDisplayContent: any = maxTrig;

            if (minTrigUnequalMaxTrig) {
                minTrigDisplayContent = minTrig;
            }

            let minTrigClassNames: string = 'fb-table-subfb-min-trig';
            let maxTrigClassNames: string = 'fb-table-subfb-max-trig';

            if (evmMaxTrg) {
                if (minTrig != evmMaxTrg && minTrigUnequalMaxTrig) {
                    minTrigClassNames = classNames(minTrigClassNames, minTrigClassNames + '-unequal');
                }

                if (maxTrig != evmMaxTrg) {
                    maxTrigClassNames = classNames(maxTrigClassNames, maxTrigClassNames + '-unequal');
                }
            }

            return (
                <tr className={className}>
                    <td>{ttcPartition.name}</td>
                    <td>{ttcPartitionTTSStateDisplay}</td>
                    <td>{ttcPartition.percentWarning}</td>
                    <td>{ttcPartition.percentBusy}</td>
                    <td><a href={frlPcUrl} target="_blank">{frlPcName}</a></td>
                    <FRLs frls={frls}/>
                    <td className={minTrigClassNames}>{minTrigDisplayContent}</td>
                    <td className={maxTrigClassNames}>{maxTrigDisplayContent}</td>
                    {this.props.additionalContent ? this.props.additionalContent : null}
                </tr>
            );
        }
    }

    interface FRLsProperties {
        frls: DAQAggregatorSnapshot.FRL[];
    }

    class FRLs extends React.Component<FRLsProperties,{}> {
        render() {
            let frls: DAQAggregatorSnapshot.FRL[] = this.props.frls;

            let pseudoFEDs: DAQAggregatorSnapshot.FED[] = [];

            let fedData: any[] = [];
            let firstFrl: boolean = true;
            frls.forEach(function (frl: DAQAggregatorSnapshot.FRL) {
                fedData.push(<FRL frl={frl} firstFrl={firstFrl}/>);
                firstFrl = false;
                DAQViewUtility.forEachOwnObjectProperty(frl.feds, function (slot: number) {
                    let fed: DAQAggregatorSnapshot.FED = frl.feds[slot];
                    if (fed) {
                        pseudoFEDs = pseudoFEDs.concat(fed.mainFeds)
                    }
                });
            });

            pseudoFEDs.forEach(function (fed: DAQAggregatorSnapshot.FED) {
                fedData.push(' ');
                fedData.push(<FEDData fed={fed}/>);
            });

            return (
                <td>{fedData}</td>
            );
        }
    }

    interface FRLProperties {
        firstFrl: boolean;
        frl: DAQAggregatorSnapshot.FRL;
    }

    class FRL extends React.Component<FRLProperties,{}> {
        render() {
            let frl: DAQAggregatorSnapshot.FRL = this.props.frl;

            let feds: {[key: number]: DAQAggregatorSnapshot.FED} = frl.feds;
            let firstFed: DAQAggregatorSnapshot.FED = feds[0];
            let firstFedDisplay: any = firstFed ? <FEDData fed={firstFed}/> : '-';
            let secondFed: DAQAggregatorSnapshot.FED = feds[1];
            let secondFedDisplay: any = secondFed ? <FEDData fed={secondFed}/> : '';

            let firstFrl: boolean = this.props.firstFrl;

            return (
                <span>
                    {firstFrl ? '' : ', '}{frl.geoSlot}:{firstFedDisplay}{secondFed ? ',' : ''}{secondFedDisplay}
                </span>
            );
        }
    }

    interface FEDDataProperties {
        fed: DAQAggregatorSnapshot.FED;
    }

    class FEDData extends React.Component<FEDDataProperties,{}> {
        render() {
            let fed: DAQAggregatorSnapshot.FED = this.props.fed;

            let percentWarning: number = fed.percentWarning;
            let percentBusy: number = fed.percentBusy;

            let ttsState: string = fed.ttsState ? fed.ttsState.substring(0, 1) : '';

            let percentBackpressure: number = fed.percentBackpressure;

            let expectedSourceId: number = fed.srcIdExpected;
            let receivedSourceId: number = fed.srcIdReceived;

            let fedCRCErrors: number = fed.numFRCerrors;
            let slinkCRCErrors: number = fed.numSCRCerrors;

            let percentWarningDisplay: any = percentWarning > 0 ?
                <span className="fb-table-fed-percent-warning">W:{percentWarning.toFixed(1)}%</span> : '';
            let percentBusyDisplay: any = percentBusy > 0 ?
                <span className="fb-table-fed-percent-busy">B:{percentBusy.toFixed(1)}%</span> : '';

            let ttsStateDisplay: string = (ttsState !== 'R' && ttsState.length !== 0) ? ttsState : '';

            let ttsStateClass: string;
            if (fed.fmmMasked === true) {
                ttsStateClass = 'fb-table-fed-tts-state-ffm-masked';
            } else {
                ttsStateClass = ttsStateDisplay.length !== 0 ? 'fb-table-fed-tts-state-' + ttsState : null;
            }

            let ttsStateClasses: string = classNames('fb-table-fed-tts-state', ttsStateClass);

            let percentBackpressureDisplay: any = percentBackpressure > 0 ?
                <span className="fb-table-fed-percent-backpressure">{'<'}{percentWarning.toFixed(1)}%</span> : '';

            let unexpectedSourceIdDisplay: any = '';
            if (receivedSourceId != expectedSourceId) {
                unexpectedSourceIdDisplay =
                    <span className="fb-table-fed-received-source-id">rcvSrcId:{receivedSourceId}</span>;
            }

            let fedCRCErrorDisplay: any = fedCRCErrors > 0 ?
                <span className="fb-table-fed-crc-errors">#FCRC={fedCRCErrors}</span> : '';

            let slinkCRCErrorDisplay: any = slinkCRCErrors > 0 ?
                <span className="fb-table-slink-crc-errors">#SCRC={slinkCRCErrors}</span> : '';

            return (
                <span className="fb-table-fed">
                    {percentWarningDisplay}
                    {percentBusyDisplay}
                    <span className={ttsStateClasses}>
                        {ttsStateDisplay}
                        {expectedSourceId}
                    </span>
                    {percentBackpressureDisplay}
                    {unexpectedSourceIdDisplay}
                    {fedCRCErrorDisplay}
                    {slinkCRCErrorDisplay}
                </span>
            );
        }
    }

    interface FEDBuilderTableSummaryRowProperties {
        numRus: number;
        fedBuilderSummary: DAQAggregatorSnapshot.FEDBuilderSummary;
    }

    class FEDBuilderTableSummaryRow extends React.Component<FEDBuilderTableSummaryRowProperties,{}> {
        render() {
            let fedBuilderSummary: DAQAggregatorSnapshot.FEDBuilderSummary = this.props.fedBuilderSummary;
            return (
                <tr className="fb-table-fb-summary-row">
                    <td colSpan="9"></td>
                    <td>Σ x / {this.props.numRus}</td>
                    <td></td>
                    <td>{(fedBuilderSummary.rate / 1000).toFixed(3)}</td>
                    <td>Σ {(fedBuilderSummary.throughput / 1024 / 1024).toFixed(1)}</td>
                    <td>
                        Σ {(fedBuilderSummary.superFragmentSizeMean / 1024).toFixed(1)}±{(fedBuilderSummary.superFragmentSizeStddev / 1024).toFixed(1)}</td>
                    <td>Δ {fedBuilderSummary.deltaEvents}</td>
                    <td>Σ {FormatUtility.formatSINumber(fedBuilderSummary.sumFragmentsInRU, 1)}</td>
                    <td>Σ {fedBuilderSummary.sumEventsInRU}</td>
                    <td>Σ {fedBuilderSummary.sumRequests}</td>
                </tr>
            );
        }
    }

}