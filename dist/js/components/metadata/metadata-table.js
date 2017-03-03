/**
 * @author Michail Vougioukas
 * @author Philipp Brummer
 */
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var DAQView;
(function (DAQView) {
    var MetadataTable = (function () {
        function MetadataTable(htmlRootElementName) {
            this.drawPausedComponent = false;
            this.htmlRootElement = document.getElementById(htmlRootElementName);
        }
        MetadataTable.prototype.setSnapshot = function (snapshot, drawPausedComponent, drawZeroDataFlowComponent, url) {
            this.snapshot = snapshot;
            this.drawPausedComponent = drawPausedComponent;
            if (!snapshot) {
                var msg = "Monitoring data unavailable: " + url;
                var errRootElement = React.createElement(ErrorElement, {message: msg, details: ""});
                ReactDOM.render(errRootElement, this.htmlRootElement);
            }
            else {
                var daq = snapshot.getDAQ();
                var metadataTableRootElement = React.createElement(MetadataTableElement, {runNumber: daq.runNumber, sessionId: daq.sessionId, dpSetPath: daq.dpsetPath, snapshotTimestamp: daq.lastUpdate, lv0State: daq.levelZeroState, daqState: daq.daqState, machineState: daq.lhcMachineMode, beamState: daq.lhcBeamMode, drawPausedComponent: drawPausedComponent});
                ReactDOM.render(metadataTableRootElement, this.htmlRootElement);
            }
        };
        return MetadataTable;
    }());
    DAQView.MetadataTable = MetadataTable;
    var MetadataTableElement = (function (_super) {
        __extends(MetadataTableElement, _super);
        function MetadataTableElement() {
            _super.apply(this, arguments);
        }
        MetadataTableElement.prototype.render = function () {
            return (React.createElement("table", {className: "metadata-table"}, React.createElement("thead", {className: "metadata-table-head"}, React.createElement("tr", {className: "metadata-table-header-row"}, React.createElement("th", null, "Run"), React.createElement("th", null, "LV0 state"), React.createElement("th", null, "LV0 state entry time"), React.createElement("th", null, "DAQ state"), React.createElement("th", null, "Machine state"), React.createElement("th", null, "Beam state"), React.createElement("th", null, "Session ID"), React.createElement("th", null, "DAQ configuration"), React.createElement("th", null, "Snapshot timestamp (local)"), React.createElement("th", null, "Snapshot timestamp (UTC)"))), React.createElement("tbody", {className: "metadata-table-body"}, React.createElement("tr", {className: "metadata-table-content-row"}, React.createElement("td", null, this.props.runNumber), React.createElement("td", null, this.props.lv0State), React.createElement("td", null, this.props.lv0StateTimestamp ? this.props.lv0StateTimestamp : 'Unknown'), React.createElement("td", null, this.props.daqState), React.createElement("td", null, this.props.machineState), React.createElement("td", null, this.props.beamState), React.createElement("td", null, this.props.sessionId), React.createElement("td", null, this.props.dpSetPath), React.createElement("td", null, new Date(this.props.snapshotTimestamp).toString()), React.createElement("td", null, new Date(this.props.snapshotTimestamp).toUTCString())))));
        };
        return MetadataTableElement;
    }(React.Component));
    var ErrorElement = (function (_super) {
        __extends(ErrorElement, _super);
        function ErrorElement() {
            _super.apply(this, arguments);
        }
        ErrorElement.prototype.render = function () {
            return (React.createElement("table", {className: "metadata-table"}, React.createElement("thead", {className: "metadata-table-head"}, React.createElement("tr", {className: "metadata-error-table-header-row"}, React.createElement("th", null, this.props.message))), React.createElement("tbody", {className: "metadata-table-body"}, React.createElement("tr", {className: "metadata-error-table-content-row"}, React.createElement("td", null, this.props.details)))));
        };
        return ErrorElement;
    }(React.Component));
})(DAQView || (DAQView = {}));
