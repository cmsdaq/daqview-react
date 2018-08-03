"use strict";
/**
 * @author Michail Vougioukas
 */
var DAQView;
(function (DAQView) {
    class LoaderReplacement {
        constructor(htmlRootElementName, configuration) {
            this.drawPausedComponent = false;
            this.htmlRootElement = document.getElementById(htmlRootElementName);
        }
        setSnapshot(snapshot, drawPausedComponent, drawZeroDataFlowComponent, drawStaleSnapshot) {
            this.snapshot = snapshot;
            this.drawPausedComponent = drawPausedComponent;
            let loaderReplacementRootElement = React.createElement(LoaderReplacementElement, { placeholder: "" });
            ReactDOM.render(loaderReplacementRootElement, this.htmlRootElement);
        }
        //to be called before setSnapshot
        prePassElementSpecificData(args) {
        }
    }
    DAQView.LoaderReplacement = LoaderReplacement;
    class LoaderReplacementElement extends React.Component {
        shouldComponentUpdate() {
            return false;
        }
        render() {
            return (React.createElement("p", null, this.props.placeholder));
        }
    }
})(DAQView || (DAQView = {}));
