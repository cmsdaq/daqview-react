"use strict";
/**
 * @author Michail Vougioukas
 */
var DAQView;
(function (DAQView) {
    class AboutTable {
        constructor(htmlRootElementName) {
            this.drawPausedComponent = false;
            this.htmlRootElement = document.getElementById(htmlRootElementName);
        }
        setSnapshot(snapshot, drawPausedComponent, drawZeroDataFlowComponent, drawStaleSnapshot, url) {
            this.snapshot = snapshot;
            this.drawPausedComponent = drawPausedComponent;
            let aboutTableRootElement = React.createElement(AboutTableElement, { project: "DAQView", authors: "Michail Vougioukas, Philipp Brummer", organization: "CERN CMS DAQ Group", year: "2016-2017" });
            ReactDOM.render(aboutTableRootElement, this.htmlRootElement);
        }
        //to be called before setSnapshot
        prePassElementSpecificData(args) {
        }
    }
    DAQView.AboutTable = AboutTable;
    class AboutTableElement extends React.Component {
        shouldComponentUpdate() {
            return false;
        }
        render() {
            return (React.createElement("table", { className: "about-table" },
                React.createElement("tbody", { className: "about-table-body" },
                    React.createElement("tr", { className: "about-table-content-row" },
                        React.createElement("td", null, this.props.project),
                        React.createElement("td", null, this.props.authors),
                        React.createElement("td", null, this.props.organization),
                        React.createElement("td", null, this.props.year)))));
        }
    }
})(DAQView || (DAQView = {}));
