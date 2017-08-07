"use strict";
/**
 * @author Philipp Brummer
 */
var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var DAQView;
(function (DAQView) {
    var DeadTimeTable = (function () {
        function DeadTimeTable(htmlRootElementName) {
            this.snapshot = null;
            this.drawPausedComponent = false;
            this.drawZeroDataFlowComponent = false;
            this.drawStaleSnapshot = false;
            this.htmlRootElement = document.getElementById(htmlRootElementName);
        }
        DeadTimeTable.prototype.setSnapshot = function (snapshot, drawPausedComponent, drawZeroDataFlowComponent, drawStaleSnapshot, url) {
            if (!snapshot) {
                var msg = "";
                var errRootElement = React.createElement(ErrorElement, { message: msg });
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
        };
        // to be called before setSnapshot
        DeadTimeTable.prototype.prePassElementSpecificData = function (args) {
        };
        DeadTimeTable.prototype.updateSnapshot = function () {
            var tcdsGlobalInfo = this.snapshot.getDAQ().tcdsGlobalInfo;
            if (!tcdsGlobalInfo) {
                console.error("No TCDS global info in snapshot.");
                return;
            }
            var drawPausedComponent = this.drawPausedComponent;
            var drawZeroDataFlowComponent = this.drawZeroDataFlowComponent;
            var drawStaleSnapshot = this.drawStaleSnapshot;
            var deadtimeTableRootElement = React.createElement(DeadtimeTableElement, { tcdsGlobalInfo: tcdsGlobalInfo, drawPausedComponent: drawPausedComponent, drawZeroDataFlowComponent: drawZeroDataFlowComponent, drawStaleSnapshot: drawStaleSnapshot });
            ReactDOM.render(deadtimeTableRootElement, this.htmlRootElement);
        };
        return DeadTimeTable;
    }());
    DAQView.DeadTimeTable = DeadTimeTable;
    var ErrorElement = (function (_super) {
        __extends(ErrorElement, _super);
        function ErrorElement() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        ErrorElement.prototype.render = function () {
            return (React.createElement("div", null, this.props.message));
        };
        return ErrorElement;
    }(React.Component));
    var DEADTIME_TABLE_HEADERS = [
        "Global TTS",
        "State",
        "% Busy",
        "% Warning",
        "Deadtime",
        "Beamactive Deadtime"
    ];
    var DEADTIME_BEAMACTIVE_PREFIX = "beamactive_";
    var DEADTIME_TABLE_STRUCTURE = [
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
    var DeadtimeTableElement = (function (_super) {
        __extends(DeadtimeTableElement, _super);
        function DeadtimeTableElement() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        DeadtimeTableElement.prototype.render = function () {
            var tcdsGlobalInfo = this.props.tcdsGlobalInfo;
            var globalTTSStates = tcdsGlobalInfo.globalTtsStates;
            var deadTimes = tcdsGlobalInfo.deadTimes;
            // XXX: What does this do?
            var drawPausedComponents = this.props.drawPausedComponent;
            var drawZeroDataFlowComponents = this.props.drawZeroDataFlowComponent;
            var drawStaleSnapshot = this.props.drawStaleSnapshot;
            var groupHeaders = [];
            var headerRowValues = [];
            /* each entry has its own column
               however, we require data row-wise to construct the html table
            */
            var stateRowValues = [];
            var busyRowValues = [];
            var warningRowValues = [];
            var deadtimeRowValues = [];
            var beamactiveDeadtimeRowValues = [];
            DEADTIME_TABLE_STRUCTURE.forEach(function (group) {
                // add group header
                groupHeaders.push({ name: group.title, colSpan: group.entries.length });
                group.entries.forEach(function (entry) {
                    // add row header
                    headerRowValues.push(entry.title);
                    // add row values
                    var ttsState = entry.stateIndex ? globalTTSStates[entry.stateIndex] : null;
                    var deadTime = entry.deadtimeIndex ? deadTimes[entry.deadtimeIndex] : null;
                    var beamactiveDeadTime = entry.deadtimeIndex ? deadTimes[DEADTIME_BEAMACTIVE_PREFIX + entry.deadtimeIndex] : null;
                    if (ttsState !== null) {
                        stateRowValues.push(ttsState.state);
                        busyRowValues.push(ttsState.percentBusy.toFixed(1));
                        warningRowValues.push(ttsState.percentWarning.toFixed(1));
                    }
                    else {
                        stateRowValues.push("");
                        busyRowValues.push("");
                        warningRowValues.push("");
                    }
                    if (deadTime !== null) {
                        deadtimeRowValues.push(deadTime.toFixed(2));
                    }
                    else {
                        deadtimeRowValues.push("");
                    }
                    if (beamactiveDeadTime !== null) {
                        beamactiveDeadtimeRowValues.push(beamactiveDeadTime.toFixed(2));
                    }
                    else {
                        beamactiveDeadtimeRowValues.push("");
                    }
                });
            });
            var tableValuesPerRow = [stateRowValues, busyRowValues, warningRowValues, deadtimeRowValues, beamactiveDeadtimeRowValues];
            var tableRows = [];
            for (var i = 1; i < DEADTIME_TABLE_HEADERS.length; i++) {
                tableRows.push(React.createElement(DeadtimeTableRow, { rowHead: DEADTIME_TABLE_HEADERS[i], rowValues: tableValuesPerRow[i - 1] }));
            }
            return (React.createElement("table", { className: "dt-table" },
                React.createElement("thead", { className: "dt-table-head" },
                    React.createElement(DeadtimeTableGroupHeaderRow, { groupHeaders: groupHeaders }),
                    React.createElement(DeadtimeTableHeaderRow, { rowHead: DEADTIME_TABLE_HEADERS[0], rowValues: headerRowValues })),
                React.createElement("tbody", { className: "dt-table-body" }, tableRows)));
        };
        return DeadtimeTableElement;
    }(React.Component));
    var DeadtimeTableGroupHeaderRow = (function (_super) {
        __extends(DeadtimeTableGroupHeaderRow, _super);
        function DeadtimeTableGroupHeaderRow() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        DeadtimeTableGroupHeaderRow.prototype.render = function () {
            var groupHeaders = this.props.groupHeaders;
            var groupHeaderColumns = [React.createElement("th", null)];
            groupHeaders.forEach(function (groupHeader) {
                groupHeaderColumns.push(React.createElement("th", { colSpan: groupHeader.colSpan }, groupHeader.name));
            });
            return (React.createElement("tr", { className: "dt-table-group-header-row" }, groupHeaderColumns));
        };
        return DeadtimeTableGroupHeaderRow;
    }(React.Component));
    var DeadtimeTableHeaderRow = (function (_super) {
        __extends(DeadtimeTableHeaderRow, _super);
        function DeadtimeTableHeaderRow() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        DeadtimeTableHeaderRow.prototype.render = function () {
            var rowHead = this.props.rowHead;
            var rowValues = this.props.rowValues;
            var row = [React.createElement("th", null, rowHead)];
            rowValues.forEach(function (rowValue) {
                row.push(React.createElement("th", null, rowValue));
            });
            return (React.createElement("tr", { className: "dt-table-header-row" }, row));
        };
        return DeadtimeTableHeaderRow;
    }(React.Component));
    var DeadtimeTableRow = (function (_super) {
        __extends(DeadtimeTableRow, _super);
        function DeadtimeTableRow() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        DeadtimeTableRow.prototype.render = function () {
            var rowHead = this.props.rowHead;
            var rowValues = this.props.rowValues;
            var row = [React.createElement("th", { className: "dt-table-header" }, rowHead)];
            rowValues.forEach(function (rowValue) {
                row.push(React.createElement("td", null, rowValue));
            });
            return (React.createElement("tr", { className: "dt-table-row" }, row));
        };
        return DeadtimeTableRow;
    }(React.Component));
})(DAQView || (DAQView = {}));
