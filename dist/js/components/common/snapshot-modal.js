/**
 * Created by mvougiou on 1/11/17.
 */
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
/**
 * @author Michail Vougioukas
 * @author Philipp Brummer
 */
var DAQView;
(function (DAQView) {
    var SnapshotModal = (function () {
        function SnapshotModal(htmlRootElementName) {
            this.drawPausedComponent = false;
            this.url = "";
            this.htmlRootElement = document.getElementById(htmlRootElementName);
        }
        SnapshotModal.prototype.setSnapshot = function (snapshot, drawPausedComponent, url) {
            this.snapshot = snapshot;
            this.drawPausedComponent = drawPausedComponent;
            this.url = url;
            if (!snapshot) {
                var msg = "";
                var errRootElement = React.createElement(ErrorElement, {message: msg});
                ReactDOM.render(errRootElement, this.htmlRootElement);
            }
            else {
                var daq = snapshot.getDAQ();
                var snapshotModalRootElement = React.createElement(SnapshotModalElement, {snapshot: snapshot, url: url});
                ReactDOM.render(snapshotModalRootElement, this.htmlRootElement);
            }
        };
        return SnapshotModal;
    }());
    DAQView.SnapshotModal = SnapshotModal;
    var SnapshotModalElement = (function (_super) {
        __extends(SnapshotModalElement, _super);
        function SnapshotModalElement() {
            _super.apply(this, arguments);
        }
        SnapshotModalElement.prototype.render = function () {
            return (React.createElement("a", {href: this.props.url, target: "_blank"}, React.createElement("button", null, "See raw DAQ snapshot")));
        };
        return SnapshotModalElement;
    }(React.Component));
    var ErrorElement = (function (_super) {
        __extends(ErrorElement, _super);
        function ErrorElement() {
            _super.apply(this, arguments);
        }
        ErrorElement.prototype.render = function () {
            return (React.createElement("div", null, this.props.message));
        };
        return ErrorElement;
    }(React.Component));
})(DAQView || (DAQView = {}));
