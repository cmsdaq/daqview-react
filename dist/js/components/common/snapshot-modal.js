"use strict";
/**
 * Created by mvougiou on 1/11/17.
 */
/**
 * @author Michail Vougioukas
 * @author Philipp Brummer
 */
var DAQView;
(function (DAQView) {
    class SnapshotModal {
        constructor(htmlRootElementName, configuration) {
            this.drawPausedComponent = false;
            this.rawSnapshotUrl = "";
            this.expertUrl = null;
            this.isExpertSetup = false;
            this.htmlRootElement = document.getElementById(htmlRootElementName);
            this.configuration = configuration;
            this.isExpertSetup = this.configuration.expertSetups.some(setup => setup === this.configuration.setupName);
        }
        setSnapshot(snapshot, drawPausedComponent, drawZeroDataFlowComponent, drawStaleSnapshot) {
            this.snapshot = snapshot;
            this.drawPausedComponent = drawPausedComponent;
            if (!snapshot) {
                let msg = "";
                let errRootElement = React.createElement(ErrorElement, { message: msg });
                ReactDOM.render(errRootElement, this.htmlRootElement);
            }
            else {
                let daq = snapshot.getDAQ();
                let time = snapshot.getUpdateTimestamp();
                let timeString = new Date(time).toISOString();
                this.rawSnapshotUrl = this.configuration.snapshotSource.url + "?setup=" + this.configuration.setupName + "&time=\"" + timeString + "\"";
                if (this.isExpertSetup && this.configuration.externalLinks.daqExpert !== null) {
                    // set expert browser range to 5 minutes before and after snapshot
                    let expertStartTimeString = new Date(time - 300000).toISOString();
                    let expertEndTimeString = new Date(time + 300000).toISOString();
                    this.expertUrl = this.configuration.externalLinks.daqExpert + "?start=" + expertStartTimeString + "&end=" + expertEndTimeString;
                }
                let snapshotModalRootElement = React.createElement(SnapshotModalElement, { expertUrl: this.expertUrl, rawSnapshotUrl: this.rawSnapshotUrl });
                ReactDOM.render(snapshotModalRootElement, this.htmlRootElement);
            }
        }
        //to be called before setSnapshot
        prePassElementSpecificData(args) {
        }
    }
    DAQView.SnapshotModal = SnapshotModal;
    class SnapshotModalElement extends React.Component {
        render() {
            let expertUrlButton = "";
            if (this.props.expertUrl !== null) {
                expertUrlButton = React.createElement("a", { href: this.props.expertUrl, target: "_blank" },
                    React.createElement("button", { className: "button-expert" }, "DAQExpert"));
            }
            return (React.createElement("div", null,
                React.createElement("button", { className: "button-share" }, "Share"),
                expertUrlButton,
                React.createElement("a", { href: this.props.rawSnapshotUrl, target: "_blank" },
                    React.createElement("button", { className: "button-snapshot" }, "See raw DAQ snapshot"))));
        }
    }
    class ErrorElement extends React.Component {
        render() {
            return (React.createElement("div", null, this.props.message));
        }
    }
})(DAQView || (DAQView = {}));
