///<reference path="../../structures/daq-aggregator/da-snapshot.ts"/>
///<reference path="../daq-snapshot-view/daq-snapshot-view.d.ts"/>

///<reference path="../../utilities/format-util.ts"/>

namespace DAQView {

    import DAQAggregatorSnapshot = DAQAggregator.Snapshot;
    import DAQ = DAQAggregator.Snapshot.DAQ;

    export class FEDBuilderTable implements DAQSnapshotView {
        public htmlRootElement: Element;

        private snapshot: DAQAggregatorSnapshot;

        constructor(htmlRootElementName: string) {
            this.htmlRootElement = document.getElementById(htmlRootElementName);
        }

        public setSnapshot(snapshot: DAQAggregatorSnapshot) {
            console.log(snapshot);
            this.snapshot = snapshot;
            let daq: DAQAggregatorSnapshot.DAQ = snapshot.getDAQ();
            let fedBuilderTableRootElement = React.createElement(FEDBuilderTableElement, {
                fedBuilders: daq.fedBuilders,
                fedBuilderSummary: daq.fedBuilderSummary,
            });
            ReactDOM.render(fedBuilderTableRootElement, this.htmlRootElement);
        }
    }

    interface FEDBuilderTableElementProperties {
        fedBuilders: DAQAggregatorSnapshot.FEDBuilder[];
        fedBuilderSummary: DAQAggregatorSnapshot.FEDBuilderSummary;
    }

    class FEDBuilderTableElement extends React.Component<FEDBuilderTableElementProperties,{}> {
        render() {
            let fbRowSubFbRowEvenClassName: string = 'fb-table-subfb-row-even';
            let fbRowSubFbRowOddClassName: string = 'fb-table-subfb-row-odd';
            let evenRow: boolean = false;

            let fedBuilders: DAQAggregatorSnapshot.FEDBuilder[] = this.props.fedBuilders;
            let rows: any[] = [];
            fedBuilders.forEach(function (fedBuilder) {
                let subFedBuilders: DAQAggregatorSnapshot.SubFEDBuilder[] = fedBuilder.subFedbuilders;
                let numSubFedBuilders: number = subFedBuilders.length;

                let ru: DAQAggregatorSnapshot.RU = fedBuilder.ru;
                let ruHostname: string = ru.hostname;
                let ruName: string = ruHostname.substring(0, ruHostname.length - 4);
                let ruUrl: string = ruHostname + ':11100/urn:xdaq-application:service=' + (ru.isEVM ? 'evm' : 'ru');

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
                subFedBuilders.forEach(subFedBuilder => rows.push(<SubFEDBuilderRow additionalClasses={rowClassName}
                                                                                    subFedBuilder={subFedBuilder}
                                                                                    additionalContent={++count == 1 ? fedBuilderData : null}/>));

                evenRow = !evenRow;
            });

            let baseHeaders: string[] = ['T', '%W', '%B', 'frlpc',
                'geoSlot:SrcId      /      TTSOnlyFEDSrcId', 'min Trg',
                'max Trg', 'FB Name', 'RU', 'warn', 'rate (kHz)', 'thru (MB/s)',
                'size (kB)', '#events', '#frags in RU', '#evts in RU', '#requests'];

            let topHeaders: string[] = baseHeaders.slice();
            topHeaders.unshift('TTCP');

            let summaryHeaders: string[] = baseHeaders.slice();
            summaryHeaders.unshift('Summary');

            let fedBuilderSummary: DAQAggregatorSnapshot.FEDBuilderSummary = this.props.fedBuilderSummary;
            let numRus: number = fedBuilders.length;

            return (
                <table className="fb-table">
                    <colgroup className="fb-table-colgroup-fedbuilder" span="9"/>
                    <colgroup className="fb-table-colgroup-evb" span="9"/>
                    <colgroup className="fb-table-colgroup-unknown" span="2"/>
                    <thead className="fb-table-head">
                    <FEDBuilderTableTopHeaderRow />
                    <FEDBuilderTableHeaderRow headers={topHeaders}/>
                    </thead>
                    <tbody className="fb-table-body">
                    {rows}
                    <FEDBuilderTableHeaderRow headers={summaryHeaders}/>
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
        headers: string[];
    }

    class FEDBuilderTableHeaderRow extends React.Component<FEDBuilderTableHeaderRowProperties,{}> {
        render() {
            let children: any[] = [];
            this.props.headers.forEach(header => children.push(<FEDBuilderTableHeader content={header}/>));
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
    }

    class FEDBuilderTableHeader extends React.Component<FEDBuilderTableHeaderProperties,{}> {
        render() {
            let additionalClasses: string | string[] = this.props.additionalClasses;
            let className: string = classNames("fb-table-header", additionalClasses);
            return (
                <th className={className} colSpan={this.props.colSpan ? this.props.colSpan : 1}>
                    {this.props.content}
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
        additionalContent?: any[];
        additionalClasses?: string | string[];
    }

    class SubFEDBuilderRow extends React.Component<SubFEDBuilderRowProperties,{}> {
        render() {
            let subFedBuilder: DAQAggregatorSnapshot.SubFEDBuilder = this.props.subFedBuilder;
            let frlPc: DAQAggregatorSnapshot.FRLPc = subFedBuilder.frlPc;
            let frlPcHostname: string = frlPc.hostname;
            let frlPcName: string = frlPcHostname.substring(0, frlPcHostname.length - 4);
            let frlPcUrl: string = frlPcHostname + ':11100';
            let frls: DAQAggregatorSnapshot.FRL[] = subFedBuilder.frls;

            let additionalClasses: string | string[] = this.props.additionalClasses;
            let className: string = classNames("fb-table-subfb-row", additionalClasses);

            let ttcPartition: DAQAggregatorSnapshot.TTCPartition = subFedBuilder.ttcPartition;
            let ttsState: string = ttcPartition.ttsState ? ttcPartition.ttsState.substring(0, 1) : '-';
            let ttsStateClasses: string = ttcPartition.ttsState ? 'fb-table-subfb-tts-state-' + ttsState : 'fb-table-subfb-tts-state-none';
            ttsStateClasses = classNames(ttsStateClasses, 'fb-table-subfb-tts-state');

            return (
                <tr className={className}>
                    <td>{ttcPartition.name}</td>
                    <td><span className={ttsStateClasses}><a href={(ttcPartition.fmm ? ttcPartition.fmm.url : '-')}
                                                             target="_blank">{ttsState}</a></span></td>
                    <td>{ttcPartition.percentWarning}</td>
                    <td>{ttcPartition.percentBusy}</td>
                    <td><a href={frlPcUrl} target="_blank">{frlPcName}</a></td>
                    <FRLs frls={frls}/>
                    <td>{subFedBuilder.minTrig}</td>
                    <td>{subFedBuilder.maxTrig}</td>
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
                console.log(frl.feds);
                DAQViewUtility.forEachOwnObjectProperty(frl.feds, function (slot: number) {
                    let fed: DAQAggregatorSnapshot.FED = frl.feds[slot];
                    if (fed) {
                        console.log(fed.mainFeds);
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

            console.log(fed);

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