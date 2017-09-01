"use strict";
/**
 * @author Michail Vougioukas
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
    var MetadataTable = (function () {
        function MetadataTable(htmlRootElementName) {
            this.drawPausedComponent = false;
            this.drawStaleSnapshot = false;
            this.runInfoTimelineLink = '';
            this.htmlRootElement = document.getElementById(htmlRootElementName);
        }
        MetadataTable.prototype.setSnapshot = function (snapshot, drawPausedComponent, drawZeroDataFlowComponent, drawStaleSnapshot, url) {
            this.snapshot = snapshot;
            this.drawPausedComponent = drawPausedComponent;
            this.drawStaleSnapshot = drawStaleSnapshot;
            if (!snapshot) {
                var msg = "Monitoring data unavailable: " + url;
                var errRootElement = React.createElement(ErrorElement, { message: msg, details: "" });
                ReactDOM.render(errRootElement, this.htmlRootElement);
            }
            else {
                var daq = snapshot.getDAQ();
                var metadataTableRootElement = React.createElement(MetadataTableElement, { runNumber: daq.runNumber, sessionId: daq.sessionId, dpSetPath: daq.dpsetPath, snapshotTimestamp: daq.lastUpdate, lv0State: daq.levelZeroState, daqState: daq.daqState, machineState: daq.lhcMachineMode, beamState: daq.lhcBeamMode, drawPausedComponent: drawPausedComponent, drawStaleSnapshot: drawStaleSnapshot, runInfoTimelineLink: this.runInfoTimelineLink, lv0StateTimestamp: daq.levelZeroStateEntry, runStartTime: daq.runStart, runDurationInMillis: daq.runDurationInMillis, daqAggregatorVersion: daq.daqAggregatorProducer });
                ReactDOM.render(metadataTableRootElement, this.htmlRootElement);
            }
        };
        //to be called before setSnapshot
        MetadataTable.prototype.prePassElementSpecificData = function (args) {
            this.runInfoTimelineLink = args[0];
        };
        return MetadataTable;
    }());
    DAQView.MetadataTable = MetadataTable;
    var MetadataTableElement = (function (_super) {
        __extends(MetadataTableElement, _super);
        function MetadataTableElement() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        MetadataTableElement.prototype.render = function () {
            var timestampClass = this.props.drawStaleSnapshot && (!this.props.drawPausedComponent) ? 'metadata-table-stale-page' : '';
            var snapshotDebug = this.props.drawStaleSnapshot && (!this.props.drawPausedComponent) ? "Check whether L0 Dynamic flashlist is there! If yes, check if DAQAggregator is running! If yes, check its logs!" : "";
            var durationDescription = "";
            if (this.props.runStartTime && this.props.runDurationInMillis) {
                var millis = this.props.runDurationInMillis;
                var days = Math.floor(millis / 86400000);
                var hours = Math.floor((millis - days * 86400000) / 3600000);
                var minutes = Math.floor((millis - days * 86400000 - hours * 3600000) / 60000);
                var seconds = Math.floor((millis - days * 86400000 - hours * 3600000 - minutes * 60000) / 1000);
                durationDescription += days ? days + "d, " : "";
                durationDescription += (hours || days) ? hours + "h, " : "";
                durationDescription += (minutes || hours || days) ? minutes + "m, " : "";
                durationDescription += (seconds || minutes || hours || days) ? seconds + "s ago " : "";
            }
            var version = this.props.daqAggregatorVersion ? this.props.daqAggregatorVersion.substring(0, this.props.daqAggregatorVersion.length - 4) : "Unknown";
            var snapshotOnHoverMessage = "Timestamp: " + this.props.snapshotTimestamp + "\nProduced by: " + version;
            if (snapshotDebug.length > 1) {
                snapshotOnHoverMessage = snapshotOnHoverMessage + "\n\n" + snapshotDebug;
            }
            return (React.createElement("table", { className: "metadata-table" },
                React.createElement("thead", { className: "metadata-table-head" },
                    React.createElement("tr", { className: "metadata-table-header-row" },
                        React.createElement("th", null, "Run number"),
                        React.createElement("th", null, "Run start time (local)"),
                        React.createElement("th", null, "LV0 state"),
                        React.createElement("th", null, "LV0 state entry time (local)"),
                        React.createElement("th", null, "DAQ state"),
                        React.createElement("th", null, "Machine state"),
                        React.createElement("th", null, "Beam state"),
                        React.createElement("th", null, "Session ID"),
                        React.createElement("th", null, "DAQ configuration"),
                        React.createElement("th", null, "Snapshot time (local)"))),
                React.createElement("tbody", { className: "metadata-table-body" },
                    React.createElement("tr", { className: "metadata-table-content-row" },
                        React.createElement("td", null,
                            React.createElement("a", { href: this.props.runInfoTimelineLink + "?run=" + (this.props.runNumber ? this.props.runNumber : '0'), target: "_blank" }, (this.props.runNumber ? this.props.runNumber : '0'))),
                        React.createElement("td", null,
                            React.createElement("div", null, this.props.runStartTime ? this.formatHumanReadableTimestamp(this.props.runStartTime) : 'Not started'),
                            React.createElement("div", { className: "metadata-table-run-duration" }, durationDescription)),
                        React.createElement("td", null, this.props.lv0State),
                        React.createElement("td", null, this.props.lv0StateTimestamp ? this.formatHumanReadableTimestamp(this.props.lv0StateTimestamp) : 'Unknown'),
                        React.createElement("td", null, this.props.daqState),
                        React.createElement("td", null, this.props.machineState),
                        React.createElement("td", null, this.props.beamState),
                        React.createElement("td", null,
                            React.createElement("a", { href: this.props.runInfoTimelineLink + "?sessionId=" + this.props.sessionId, target: "_blank" }, this.props.sessionId)),
                        React.createElement("td", null, this.props.dpSetPath),
                        React.createElement("td", { className: timestampClass },
                            React.createElement("div", { title: snapshotOnHoverMessage }, this.formatHumanReadableTimestamp(this.props.snapshotTimestamp)))))));
        };
        MetadataTableElement.prototype.formatHumanReadableTimestamp = function (dateTs) {
            var ret = "";
            var dateTokens = new Date(dateTs).toString().split(" ");
            var mapOfMonths = {
                "Jan": "01",
                "Feb": "02",
                "Mar": "03",
                "Apr": "04",
                "May": "05",
                "Jun": "06",
                "Jul": "07",
                "Aug": "08",
                "Sep": "09",
                "Oct": "10",
                "Nov": "11",
                "Dec": "12"
            };
            ret = dateTokens[0] + " " + dateTokens[2] + "/" + mapOfMonths[dateTokens[1]] + "/" + dateTokens[3] + ", " + dateTokens[4] + " " + dateTokens[5] + " " + dateTokens[6];
            return ret;
        };
        return MetadataTableElement;
    }(React.PureComponent));
    var ErrorElement = (function (_super) {
        __extends(ErrorElement, _super);
        function ErrorElement() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        ErrorElement.prototype.render = function () {
            return (React.createElement("table", { className: "metadata-table" },
                React.createElement("thead", { className: "metadata-table-head" },
                    React.createElement("tr", { className: "metadata-error-table-header-row" },
                        React.createElement("th", null, this.props.message))),
                React.createElement("tbody", { className: "metadata-table-body" },
                    React.createElement("tr", { className: "metadata-error-table-content-row" },
                        React.createElement("td", null, this.props.details)))));
        };
        return ErrorElement;
    }(React.PureComponent));
})(DAQView || (DAQView = {}));
