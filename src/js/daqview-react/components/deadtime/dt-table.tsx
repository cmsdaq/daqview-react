/**
 * @author Philipp Brummer
 */


namespace DAQView {
    import DAQAggregatorSnapshot = DAQAggregator.Snapshot;
    import DeadTimes = DAQAggregator.Snapshot.DeadTimes;
    import TCDSGlobalInfo = DAQAggregator.Snapshot.TCDSGlobalInfo;
    import TTSState = DAQAggregator.Snapshot.TTSState;

    export class DeadTimeTable implements DAQSnapshotView {

        public htmlRootElement: Element;

        private snapshot: DAQAggregatorSnapshot = null;
        private drawPausedComponent: boolean = false;
        private drawZeroDataFlowComponent: boolean = false;
        private drawStaleSnapshot: boolean = false;

        constructor(htmlRootElementName: string) {
            this.htmlRootElement = document.getElementById(htmlRootElementName);
        }

        public setSnapshot(snapshot: DAQAggregatorSnapshot, drawPausedComponent: boolean, drawZeroDataFlowComponent: boolean, drawStaleSnapshot: boolean, url: string) {
            if (!snapshot) {
                let msg: string = "";
                let errRootElement: any = <ErrorElement message={msg}/>;
                ReactDOM.render(errRootElement, this.htmlRootElement);
            } else {
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

        // to be called before setSnapshot
        public prePassElementSpecificData(args: string []) {
        }

        private updateSnapshot() {
            let tcdsGlobalInfo: TCDSGlobalInfo = this.snapshot.getDAQ().tcdsGlobalInfo;

            if (!tcdsGlobalInfo) {
                console.warn("No TCDS global info in snapshot.");
                return;
            }

            let drawPausedComponent: boolean = this.drawPausedComponent;
            let drawZeroDataFlowComponent: boolean = this.drawZeroDataFlowComponent;
            let drawStaleSnapshot: boolean = this.drawStaleSnapshot;

            let deadtimeTableRootElement: any = <DeadtimeTableElement tcdsGlobalInfo={tcdsGlobalInfo}
                                                                      drawPausedComponent={drawPausedComponent}
                                                                      drawZeroDataFlowComponent={drawZeroDataFlowComponent}
                                                                      drawStaleSnapshot={drawStaleSnapshot}/>
            ReactDOM.render(deadtimeTableRootElement, this.htmlRootElement);
        }
    }

    interface ErrorElementProperties {
        message: string;
    }

    class ErrorElement extends React.PureComponent<ErrorElementProperties,{}> {
        render() {
            return (
                <div>{this.props.message}</div>
            );
        }
    }

    const DEADTIME_TABLE_HEADERS: string[] =
        [
            "Global TTS",
            "State",
            // "% Busy",
            // "% Warning",
            "Deadtime",
            "Beamactive Deadtime"
        ];

    interface DeadtimeTableGroup {
        title: string;
        entries: DeadtimeTableEntry[];
    }

    interface DeadtimeTableEntry{
        title: string;
        stateIndex?: string;
        deadtimeIndex?: string;
    }

    const DEADTIME_BEAMACTIVE_PREFIX = "beamactive_";

    const DEADTIME_TABLE_STRUCTURE: DeadtimeTableGroup[] =
        [
            {
                title: "",
                entries: [
                    {title: "Total", deadtimeIndex: "total"},
                    {title: "TTS", stateIndex: "tts_toplevel", deadtimeIndex: "tts"},
                    {title: "trigger rules", deadtimeIndex: "trg_rules"}
                ]
            },
            {
                title: "trigger veto",
                entries: [
                    {title: "bunch-mask", stateIndex: "block_bx_mask", deadtimeIndex: "bx_mask"},
                    {title: "ReTri", stateIndex: "block_retri", deadtimeIndex: "retri"},
                    {title: "PM APVE", stateIndex: "block_pm_apve", deadtimeIndex: "apve"}
                ]
            },
            {
                title: "",
                entries: [
                    {title: "DAQ backpressure to PM", stateIndex: "block_daq_backpressure", deadtimeIndex: "daq_bp"},
                    {title: "calibration sequence", deadtimeIndex: "calib"}
                ]
            },
            {
                title: "pauses",
                entries: [
                    {title: "software", deadtimeIndex: "sw_pause"},
                    {title: "firmware", deadtimeIndex: "fw_pause"}
                ]
            }
        ];

    interface DeadtimeTableElementProperties {
        tcdsGlobalInfo: TCDSGlobalInfo;
        drawPausedComponent: boolean;
        drawZeroDataFlowComponent: boolean;
        drawStaleSnapshot: boolean;
    }

    class DeadtimeTableElement extends React.Component<DeadtimeTableElementProperties, {}> {

        render() {
            let tcdsGlobalInfo: TCDSGlobalInfo = this.props.tcdsGlobalInfo;

            let globalTTSStates: {[key:string]: TTSState} = tcdsGlobalInfo.globalTtsStates;
            let deadTimes: DeadTimes = tcdsGlobalInfo.deadTimes;

            if (!deadTimes) {
                console.warn("No dead times in snapshot.");
                return;
            }

            // XXX: What does this do?
            let drawPausedComponents: boolean = this.props.drawPausedComponent;
            let drawZeroDataFlowComponents: boolean = this.props.drawZeroDataFlowComponent;
            let drawStaleSnapshot = this.props.drawStaleSnapshot;

            let groupHeaders: DeadtimeTableGroupHeader[] = [];

            let headerRowValues: string[] = [];

            /* each entry has its own column
               however, we require data row-wise to construct the html table
            */
            let stateRowValues: string[] = [];
            let busyRowValues: string[] = [];
            let warningRowValues: string[] = [];
            let deadtimeRowValues: string[] = [];
            let beamactiveDeadtimeRowValues: string[] = [];

            DEADTIME_TABLE_STRUCTURE.forEach(function(group: DeadtimeTableGroup) {
                // add group header
                groupHeaders.push({name: group.title, colSpan: group.entries.length});

                group.entries.forEach(function(entry: DeadtimeTableEntry){
                    // add row header
                    headerRowValues.push(entry.title);

                    // add row values
                    let ttsState: TTSState = entry.stateIndex ? globalTTSStates[entry.stateIndex] : null;
                    let deadTime: number = entry.deadtimeIndex ? deadTimes[entry.deadtimeIndex] : null;
                    let beamactiveDeadTime: number = entry.deadtimeIndex ? deadTimes[DEADTIME_BEAMACTIVE_PREFIX + entry.deadtimeIndex] : null;

                    if (ttsState === null) {
                        stateRowValues.push("");
                        busyRowValues.push("");
                        warningRowValues.push("");
                    } else if (!ttsState) {
                        stateRowValues.push("N/A");
                        busyRowValues.push("N/A");
                        warningRowValues.push("N/A");
                    } else {
                        stateRowValues.push(ttsState.state.substring(0, 1));
                        busyRowValues.push(ttsState.percentBusy.toFixed(1));
                        warningRowValues.push(ttsState.percentWarning.toFixed(1));
                    }
                    if (deadTime === null) {
                        deadtimeRowValues.push("");
                    } else if (!deadTime) {
                        deadtimeRowValues.push("N/A");
                    } else {
                        deadtimeRowValues.push(deadTime.toFixed(2));
                    }
                    if (beamactiveDeadTime === null) {
                        beamactiveDeadtimeRowValues.push("");
                    } else if (!beamactiveDeadTime) {
                        beamactiveDeadtimeRowValues.push("N/A");
                    } else {
                        beamactiveDeadtimeRowValues.push(beamactiveDeadTime.toFixed(2));
                    }
                });
            });

            let tableValuesPerRow: string[][] =
                [stateRowValues, /* busyRowValues, warningRowValues, */ deadtimeRowValues, beamactiveDeadtimeRowValues];

            let tableRows: any[] = [];
            for (let i: number = 1; i < DEADTIME_TABLE_HEADERS.length; i++) {
                tableRows.push(<DeadtimeTableRow rowHead={DEADTIME_TABLE_HEADERS[i]} rowValues={tableValuesPerRow[i-1]} />);
            }

            return (
                <table className="dt-table">
                    <thead className="dt-table-head">
                        <DeadtimeTableGroupHeaderRow groupHeaders={groupHeaders} />
                        <DeadtimeTableHeaderRow rowHead={DEADTIME_TABLE_HEADERS[0]} rowValues={headerRowValues} />
                    </thead>
                    <tbody className="dt-table-body">
                    {tableRows}
                    </tbody>
                </table>
            );
        }
    }

    interface DeadtimeTableGroupHeader {
        name: string;
        colSpan: number;
    }

    interface DeadtimeTableGroupHeaderProperties {
        groupHeaders: DeadtimeTableGroupHeader[];
    }

    class DeadtimeTableGroupHeaderRow extends React.Component<DeadtimeTableGroupHeaderProperties, {}> {
        shouldComponentUpdate() {
            return false
        }

        render() {
            let groupHeaders: DeadtimeTableGroupHeader[] = this.props.groupHeaders;

            let groupHeaderColumns: any[] = [<th></th>];

            groupHeaders.forEach(function(groupHeader: DeadtimeTableGroupHeader) {
                groupHeaderColumns.push(<th colSpan={groupHeader.colSpan}>{groupHeader.name}</th>);
            });

            return (<tr className="dt-table-group-header-row">{groupHeaderColumns}</tr>);
        }
    }

    interface DeadtimeTableHeaderRowProperties {
        rowHead: string;
        rowValues: string[];
    }

    class DeadtimeTableHeaderRow extends React.Component<DeadtimeTableHeaderRowProperties, {}> {
        shouldComponentUpdate() {
            return false
        }

        render() {
            let rowHead: string = this.props.rowHead;
            let rowValues: string[] = this.props.rowValues;

            let row: any[] = [<th>{rowHead}</th>];

            rowValues.forEach(function(rowValue: string) {
                row.push(<th>{rowValue}</th>);
            });

            return (<tr className="dt-table-header-row">{row}</tr>);
        }
    }

    interface DeadtimeTableRowProperties {
        rowHead: string;
        rowValues: string[];
    }

    class DeadtimeTableRow extends React.Component<DeadtimeTableRowProperties, {}> {
        shouldComponentUpdate(nextProps: DeadtimeTableRowProperties) {
            let shouldUpdate: boolean = false;

            if (this.props.rowValues.length == nextProps.rowValues.length) {
                for (let i = 0; !shouldUpdate && i < this.props.rowValues.length; i++)
                {
                    shouldUpdate = this.props.rowValues[i] !== nextProps.rowValues[i];
                }
            }

            return shouldUpdate;
        }

        render() {
            let rowHead: string = this.props.rowHead;
            let rowValues: string[] = this.props.rowValues;

            let row: any[] = [<th className="dt-table-header">{rowHead}</th>];

            rowValues.forEach(function(rowValue: string) {
                row.push(<td>{rowValue}</td>);
            });

            return (<tr className="dt-table-row">{row}</tr>);
        }
    }

}