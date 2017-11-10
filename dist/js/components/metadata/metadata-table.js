"use strict";
/**
 * @author Michail Vougioukas
 * @author Philipp Brummer
 */
var DAQView;
(function (DAQView) {
    class MetadataTable {
        constructor(htmlRootElementName, configuration) {
            this.drawPausedComponent = false;
            this.drawStaleSnapshot = false;
            this.runInfoTimelineLink = null;
            this.htmlRootElement = document.getElementById(htmlRootElementName);
            this.configuration = configuration;
        }
        setSnapshot(snapshot, drawPausedComponent, drawZeroDataFlowComponent, drawStaleSnapshot) {
            this.snapshot = snapshot;
            this.drawPausedComponent = drawPausedComponent;
            this.drawStaleSnapshot = drawStaleSnapshot;
            if (!snapshot) {
                let url = this.configuration.snapshotSource.url + "?setup=" + this.configuration.setupName;
                let msg = "Monitoring data unavailable: " + url;
                let errRootElement = React.createElement(ErrorElement, { message: msg, details: "" });
                ReactDOM.render(errRootElement, this.htmlRootElement);
            }
            else {
                let daq = snapshot.getDAQ();
                let metadataTableRootElement = React.createElement(MetadataTableElement, { runNumber: daq.runNumber, sessionId: daq.sessionId, dpSetPath: daq.dpsetPath, snapshotTimestamp: daq.lastUpdate, lv0State: daq.levelZeroState, daqState: daq.daqState, machineState: daq.lhcMachineMode, beamState: daq.lhcBeamMode, drawPausedComponent: drawPausedComponent, drawStaleSnapshot: drawStaleSnapshot, runInfoTimelineLink: this.runInfoTimelineLink, lv0StateTimestamp: daq.levelZeroStateEntry, runStartTime: daq.runStart, runDurationInMillis: daq.runDurationInMillis, daqAggregatorVersion: daq.daqAggregatorProducer });
                ReactDOM.render(metadataTableRootElement, this.htmlRootElement);
            }
        }
        //to be called before setSnapshot
        prePassElementSpecificData(args) {
            this.runInfoTimelineLink = args[0];
        }
    }
    DAQView.MetadataTable = MetadataTable;
    class MetadataTableElement extends React.PureComponent {
        render() {
            let timestampClass = this.props.drawStaleSnapshot && (!this.props.drawPausedComponent) ? 'metadata-table-stale-page' : '';
            let snapshotDebug = this.props.drawStaleSnapshot && (!this.props.drawPausedComponent) ? "Check whether L0 Dynamic flashlist is there! If yes, check if DAQAggregator is running! If yes, check its logs!" : "";
            let durationDescription = "";
            if (this.props.runStartTime && this.props.runDurationInMillis) {
                let millis = this.props.runDurationInMillis;
                let days = Math.floor(millis / 86400000);
                let hours = Math.floor((millis - days * 86400000) / 3600000);
                let minutes = Math.floor((millis - days * 86400000 - hours * 3600000) / 60000);
                let seconds = Math.floor((millis - days * 86400000 - hours * 3600000 - minutes * 60000) / 1000);
                durationDescription += days ? days + "d, " : "";
                durationDescription += (hours || days) ? hours + "h, " : "";
                durationDescription += (minutes || hours || days) ? minutes + "m, " : "";
                durationDescription += (seconds || minutes || hours || days) ? seconds + "s ago " : "";
            }
            let version = this.props.daqAggregatorVersion ? this.props.daqAggregatorVersion.substring(0, this.props.daqAggregatorVersion.length - 4) : "Unknown";
            let snapshotOnHoverMessage = "Timestamp: " + this.props.snapshotTimestamp + "\nProduced by: " + version;
            if (snapshotDebug.length > 1) {
                snapshotOnHoverMessage = snapshotOnHoverMessage + "\n\n" + snapshotDebug;
            }
            let runNumber = (this.props.runNumber ? this.props.runNumber : '0');
            let snapshotRun = runNumber;
            let snapshotSession = this.props.sessionId;
            if (this.props.runInfoTimelineLink !== null) {
                snapshotRun = React.createElement("a", { href: this.props.runInfoTimelineLink + "?run=" + runNumber, target: "_blank" }, runNumber);
                snapshotSession = React.createElement("a", { href: this.props.runInfoTimelineLink + "?sessionId=" + this.props.sessionId, target: "_blank" }, this.props.sessionId);
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
                        React.createElement("td", null, snapshotRun),
                        React.createElement("td", null,
                            React.createElement("div", null, this.props.runStartTime ? this.formatHumanReadableTimestamp(this.props.runStartTime) : 'Not started'),
                            React.createElement("div", { className: "metadata-table-run-duration" }, durationDescription)),
                        React.createElement("td", null, this.props.lv0State),
                        React.createElement("td", null, this.props.lv0StateTimestamp ? this.formatHumanReadableTimestamp(this.props.lv0StateTimestamp) : 'Unknown'),
                        React.createElement("td", null, this.props.daqState),
                        React.createElement("td", null, this.props.machineState),
                        React.createElement("td", null, this.props.beamState),
                        React.createElement("td", null, snapshotSession),
                        React.createElement("td", null, this.props.dpSetPath),
                        React.createElement("td", { className: timestampClass },
                            React.createElement("div", { title: snapshotOnHoverMessage }, this.formatHumanReadableTimestamp(this.props.snapshotTimestamp)))))));
        }
        formatHumanReadableTimestamp(dateTs) {
            let ret = "";
            let dateTokens = new Date(dateTs).toString().split(" ");
            let mapOfMonths = {
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
        }
    }
    class ErrorElement extends React.PureComponent {
        render() {
            return (React.createElement("table", { className: "metadata-table" },
                React.createElement("thead", { className: "metadata-table-head" },
                    React.createElement("tr", { className: "metadata-error-table-header-row" },
                        React.createElement("th", null, this.props.message))),
                React.createElement("tbody", { className: "metadata-table-body" },
                    React.createElement("tr", { className: "metadata-error-table-content-row" },
                        React.createElement("td", null, this.props.details)))));
        }
    }
})(DAQView || (DAQView = {}));
