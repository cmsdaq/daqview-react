"use strict";
/**
 * @author Philipp Brummer
 */
var DAQView;
(function (DAQView) {
    class DeadTimeTable {
        constructor(htmlRootElementName) {
            this.snapshot = null;
            this.drawPausedComponent = false;
            this.drawZeroDataFlowComponent = false;
            this.drawStaleSnapshot = false;
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
        // to be called before setSnapshot
        prePassElementSpecificData(args) {
        }
        updateSnapshot() {
            let tcdsGlobalInfo = this.snapshot.getDAQ().tcdsGlobalInfo;
            if (!tcdsGlobalInfo) {
                console.warn("No TCDS global info in snapshot.");
                return;
            }
            let drawPausedComponent = this.drawPausedComponent;
            let drawZeroDataFlowComponent = this.drawZeroDataFlowComponent;
            let drawStaleSnapshot = this.drawStaleSnapshot;
            let deadtimeTableRootElement = React.createElement(DeadtimeTableElement, { tcdsGlobalInfo: tcdsGlobalInfo, drawPausedComponent: drawPausedComponent, drawZeroDataFlowComponent: drawZeroDataFlowComponent, drawStaleSnapshot: drawStaleSnapshot });
            ReactDOM.render(deadtimeTableRootElement, this.htmlRootElement);
        }
    }
    DAQView.DeadTimeTable = DeadTimeTable;
    class ErrorElement extends React.PureComponent {
        render() {
            return (React.createElement("div", null, this.props.message));
        }
    }
    const DEADTIME_TABLE_HEADERS = [
        "Global TTS",
        "State",
        // "% Busy",
        // "% Warning",
        "Deadtime",
        "Beamactive Deadtime"
    ];
    const DEADTIME_BEAMACTIVE_PREFIX = "beamactive_";
    const DEADTIME_TABLE_STRUCTURE = [
        {
            title: "",
            entries: [
                { title: "Total", deadtimeIndex: "total" },
                { title: "TTS", stateIndex: "tts_toplevel", deadtimeIndex: "tts" },
                { title: "trigger rules", deadtimeIndex: "trg_rules" }
            ]
        },
        {
            title: "trigger veto",
            entries: [
                { title: "bunch-mask", stateIndex: "block_bx_mask", deadtimeIndex: "bx_mask" },
                { title: "ReTri", stateIndex: "block_retri", deadtimeIndex: "retri" },
                { title: "PM APVE", stateIndex: "block_pm_apve", deadtimeIndex: "apve" }
            ]
        },
        {
            title: "",
            entries: [
                { title: "DAQ backpressure to PM", stateIndex: "block_daq_backpressure", deadtimeIndex: "daq_bp" },
                { title: "calibration sequence", deadtimeIndex: "calib" }
            ]
        },
        {
            title: "pauses",
            entries: [
                { title: "software", deadtimeIndex: "sw_pause" },
                { title: "firmware", deadtimeIndex: "fw_pause" }
            ]
        }
    ];
    class DeadtimeTableElement extends React.Component {
        render() {
            let tcdsGlobalInfo = this.props.tcdsGlobalInfo;
            let globalTTSStates = tcdsGlobalInfo.globalTtsStates;
            let deadTimes = tcdsGlobalInfo.deadTimesInstant;
            if (!deadTimes) {
                console.warn("No dead times in snapshot.");
                return;
            }
            let drawPausedComponent = this.props.drawPausedComponent;
            let drawZeroDataFlowComponent = this.props.drawZeroDataFlowComponent;
            let drawStaleSnapshot = this.props.drawStaleSnapshot;
            let groupHeaders = [];
            let headerRowValues = [];
            /* each entry has its own column
               however, we require data row-wise to construct the html table
            */
            let stateRowValues = [];
            let busyRowValues = [];
            let warningRowValues = [];
            let deadtimeRowValues = [];
            let beamactiveDeadtimeRowValues = [];
            DEADTIME_TABLE_STRUCTURE.forEach(function (group) {
                // add group header
                groupHeaders.push({ name: group.title, colSpan: group.entries.length });
                group.entries.forEach(function (entry) {
                    // add row header
                    headerRowValues.push(entry.title);
                    // add row values
                    let ttsState = entry.stateIndex ? globalTTSStates[entry.stateIndex] : null;
                    let deadTime = entry.deadtimeIndex ? deadTimes[entry.deadtimeIndex] : null;
                    let beamactiveDeadTime = entry.deadtimeIndex ? deadTimes[DEADTIME_BEAMACTIVE_PREFIX + entry.deadtimeIndex] : null;
                    if (ttsState === null) {
                        stateRowValues.push("");
                        busyRowValues.push("");
                        warningRowValues.push("");
                    }
                    else if (ttsState === undefined) {
                        stateRowValues.push("N/A");
                        busyRowValues.push("N/A");
                        warningRowValues.push("N/A");
                    }
                    else {
                        stateRowValues.push(ttsState.state.substring(0, 1));
                        busyRowValues.push(ttsState.percentBusy.toFixed(1));
                        warningRowValues.push(ttsState.percentWarning.toFixed(1));
                    }
                    if (deadTime === null) {
                        deadtimeRowValues.push("");
                    }
                    else if (deadTime === undefined) {
                        deadtimeRowValues.push("N/A");
                    }
                    else {
                        deadtimeRowValues.push(deadTime.toFixed(2));
                    }
                    if (beamactiveDeadTime === null) {
                        beamactiveDeadtimeRowValues.push("");
                    }
                    else if (beamactiveDeadTime === undefined) {
                        beamactiveDeadtimeRowValues.push("N/A");
                    }
                    else {
                        beamactiveDeadtimeRowValues.push(beamactiveDeadTime.toFixed(2));
                    }
                });
            });
            let tableValuesPerRow = [stateRowValues, /* busyRowValues, warningRowValues, */ deadtimeRowValues, beamactiveDeadtimeRowValues];
            let tableRows = [];
            for (let i = 1; i < DEADTIME_TABLE_HEADERS.length; i++) {
                tableRows.push(React.createElement(DeadtimeTableRow, { rowHead: DEADTIME_TABLE_HEADERS[i], rowValues: tableValuesPerRow[i - 1], drawPausedComponent: drawPausedComponent, drawZeroDataFlowComponent: drawZeroDataFlowComponent, drawStaleSnapshot: drawStaleSnapshot }));
            }
            return (React.createElement("table", { className: "dt-table" },
                React.createElement("thead", { className: "dt-table-head" },
                    React.createElement(DeadtimeTableGroupHeaderRow, { groupHeaders: groupHeaders }),
                    React.createElement(DeadtimeTableHeaderRow, { rowHead: DEADTIME_TABLE_HEADERS[0], rowValues: headerRowValues })),
                React.createElement("tbody", { className: "dt-table-body" }, tableRows)));
        }
    }
    class DeadtimeTableGroupHeaderRow extends React.Component {
        shouldComponentUpdate() {
            return false;
        }
        render() {
            let groupHeaders = this.props.groupHeaders;
            let groupHeaderColumns = [React.createElement("th", null)];
            groupHeaders.forEach(function (groupHeader) {
                groupHeaderColumns.push(React.createElement("th", { colSpan: groupHeader.colSpan }, groupHeader.name));
            });
            return (React.createElement("tr", { className: "dt-table-group-header-row" }, groupHeaderColumns));
        }
    }
    class DeadtimeTableHeaderRow extends React.Component {
        shouldComponentUpdate() {
            return false;
        }
        render() {
            let rowHead = this.props.rowHead;
            let rowValues = this.props.rowValues;
            let row = [React.createElement("th", null, rowHead)];
            rowValues.forEach(function (rowValue) {
                row.push(React.createElement("th", null, rowValue));
            });
            return (React.createElement("tr", { className: "dt-table-header-row" }, row));
        }
    }
    class DeadtimeTableRow extends React.Component {
        shouldComponentUpdate(nextProps) {
            let shouldUpdate = false;
            shouldUpdate = shouldUpdate || this.props.drawPausedComponent !== nextProps.drawPausedComponent;
            shouldUpdate = shouldUpdate || this.props.drawZeroDataFlowComponent !== nextProps.drawZeroDataFlowComponent;
            shouldUpdate = shouldUpdate || this.props.drawStaleSnapshot !== nextProps.drawStaleSnapshot;
            if (!shouldUpdate && this.props.rowValues.length == nextProps.rowValues.length) {
                for (let i = 0; !shouldUpdate && i < this.props.rowValues.length; i++) {
                    shouldUpdate = this.props.rowValues[i] !== nextProps.rowValues[i];
                }
            }
            return shouldUpdate;
        }
        render() {
            let rowHead = this.props.rowHead;
            let rowValues = this.props.rowValues;
            let drawPausedComponent = this.props.drawPausedComponent;
            let drawZeroDataFlowComponent = this.props.drawZeroDataFlowComponent;
            let drawStaleSnapshot = this.props.drawStaleSnapshot;
            let dtRowClass = "dt-table-row-running";
            if (drawPausedComponent) {
                dtRowClass = "dt-table-row-paused";
            }
            if (drawZeroDataFlowComponent) {
                dtRowClass = "dt-table-row-ratezero";
            }
            if (drawStaleSnapshot && (!drawPausedComponent)) {
                dtRowClass = 'dt-table-row-stale-page';
            }
            let row = [React.createElement("th", { className: "dt-table-header" }, rowHead)];
            rowValues.forEach(function (rowValue) {
                row.push(React.createElement("td", null, rowValue));
            });
            return (React.createElement("tr", { className: dtRowClass }, row));
        }
    }
})(DAQView || (DAQView = {}));
