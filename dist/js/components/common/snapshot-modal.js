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
        constructor(htmlRootElementName) {
            this.drawPausedComponent = false;
            this.url = "";
            this.htmlRootElement = document.getElementById(htmlRootElementName);
        }
        setSnapshot(snapshot, drawPausedComponent, drawZeroDataFlowComponent, drawStaleSnapshot, url) {
            this.snapshot = snapshot;
            this.drawPausedComponent = drawPausedComponent;
            this.url = url;
            if (!snapshot) {
                let msg = "";
                let errRootElement = React.createElement(ErrorElement, { message: msg });
                ReactDOM.render(errRootElement, this.htmlRootElement);
            }
            else {
                let daq = snapshot.getDAQ();
                let snapshotModalRootElement = React.createElement(SnapshotModalElement, { daq: daq, url: url });
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
            return (React.createElement("div", null,
                React.createElement("button", { className: "button-share" }, "Share"),
                React.createElement("a", { href: this.props.url, target: "_blank" },
                    React.createElement("button", { className: "button-snapshot" }, "See raw DAQ snapshot"))));
        }
    }
    class ErrorElement extends React.Component {
        render() {
            return (React.createElement("div", null, this.props.message));
        }
    }
})(DAQView || (DAQView = {}));
