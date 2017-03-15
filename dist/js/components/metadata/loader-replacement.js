/**
 * @author Michail Vougioukas
 */
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var DAQView;
(function (DAQView) {
    var LoaderReplacement = (function () {
        function LoaderReplacement(htmlRootElementName) {
            this.drawPausedComponent = false;
            this.htmlRootElement = document.getElementById(htmlRootElementName);
        }
        LoaderReplacement.prototype.setSnapshot = function (snapshot, drawPausedComponent, drawZeroDataFlowComponent, drawStaleSnapshot, url) {
            this.snapshot = snapshot;
            this.drawPausedComponent = drawPausedComponent;
            var loaderReplacementRootElement = React.createElement(LoaderReplacementElement, {placeholder: ""});
            ReactDOM.render(loaderReplacementRootElement, this.htmlRootElement);
        };
        //to be called before setSnapshot
        LoaderReplacement.prototype.prePassElementSpecificData = function (args) {
        };
        return LoaderReplacement;
    }());
    DAQView.LoaderReplacement = LoaderReplacement;
    var LoaderReplacementElement = (function (_super) {
        __extends(LoaderReplacementElement, _super);
        function LoaderReplacementElement() {
            _super.apply(this, arguments);
        }
        LoaderReplacementElement.prototype.render = function () {
            return (React.createElement("p", null, this.props.placeholder));
        };
        return LoaderReplacementElement;
    }(React.Component));
})(DAQView || (DAQView = {}));
