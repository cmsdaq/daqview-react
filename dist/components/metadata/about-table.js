"use strict";
/**
 * @author Michail Vougioukas
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
    var AboutTable = (function () {
        function AboutTable(htmlRootElementName) {
            this.drawPausedComponent = false;
            this.htmlRootElement = document.getElementById(htmlRootElementName);
        }
        AboutTable.prototype.setSnapshot = function (snapshot, drawPausedComponent, drawZeroDataFlowComponent, drawStaleSnapshot, url) {
            this.snapshot = snapshot;
            this.drawPausedComponent = drawPausedComponent;
            var aboutTableRootElement = React.createElement(AboutTableElement, { project: "DAQView", authors: "Michail Vougioukas, Philipp Brummer", organization: "CERN CMS DAQ Group", year: "2016-2017" });
            ReactDOM.render(aboutTableRootElement, this.htmlRootElement);
        };
        //to be called before setSnapshot
        AboutTable.prototype.prePassElementSpecificData = function (args) {
        };
        return AboutTable;
    }());
    DAQView.AboutTable = AboutTable;
    var AboutTableElement = (function (_super) {
        __extends(AboutTableElement, _super);
        function AboutTableElement() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        AboutTableElement.prototype.render = function () {
            return (React.createElement("table", { className: "about-table" },
                React.createElement("tbody", { className: "about-table-body" },
                    React.createElement("tr", { className: "about-table-content-row" },
                        React.createElement("td", null, this.props.project),
                        React.createElement("td", null, this.props.authors),
                        React.createElement("td", null, this.props.organization),
                        React.createElement("td", null, this.props.year)))));
        };
        return AboutTableElement;
    }(React.Component));
})(DAQView || (DAQView = {}));
