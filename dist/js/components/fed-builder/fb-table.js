///<reference path="../../structures/daq-aggregator/da-snapshot.ts"/>
///<reference path="../daq-snapshot-view/daq-snapshot-view.d.ts"/>
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
///<reference path="../../utilities/format-util.ts"/>
var DAQView;
(function (DAQView) {
    var FEDBuilderTable = (function () {
        function FEDBuilderTable(htmlRootElementName) {
            this.htmlRootElement = document.getElementById(htmlRootElementName);
        }
        FEDBuilderTable.prototype.setSnapshot = function (snapshot) {
            console.log(snapshot);
            this.snapshot = snapshot;
            var daq = snapshot.getDAQ();
            var fedBuilderTableRootElement = React.createElement(FEDBuilderTableElement, {
                fedBuilders: daq.fedBuilders,
                fedBuilderSummary: daq.fedBuilderSummary,
            });
            ReactDOM.render(fedBuilderTableRootElement, this.htmlRootElement);
        };
        return FEDBuilderTable;
    }());
    DAQView.FEDBuilderTable = FEDBuilderTable;
    var FEDBuilderTableElement = (function (_super) {
        __extends(FEDBuilderTableElement, _super);
        function FEDBuilderTableElement() {
            _super.apply(this, arguments);
        }
        FEDBuilderTableElement.prototype.render = function () {
            var fbRowSubFbRowEvenClassName = 'fb-table-subfb-row-even';
            var fbRowSubFbRowOddClassName = 'fb-table-subfb-row-odd';
            var evenRow = false;
            var fedBuilders = this.props.fedBuilders;
            var rows = [];
            fedBuilders.forEach(function (fedBuilder) {
                var subFedBuilders = fedBuilder.subFedbuilders;
                var numSubFedBuilders = subFedBuilders.length;
                var ru = fedBuilder.ru;
                var ruHostname = ru.hostname;
                var ruName = ruHostname.substring(0, ruHostname.length - 4);
                var ruUrl = ruHostname + ':11100/urn:xdaq-application:service=' + (ru.isEVM ? 'evm' : 'ru');
                var fedBuilderData = [];
                fedBuilderData.push(React.createElement("td", {rowSpan: numSubFedBuilders}, fedBuilder.name));
                fedBuilderData.push(React.createElement("td", {rowSpan: numSubFedBuilders}, React.createElement("a", {href: ruUrl, target: "_blank"}, ruName)));
                fedBuilderData.push(React.createElement(RUMessages, {rowSpan: numSubFedBuilders, infoMessage: ru.infoMsg, warnMessage: ru.warnMsg, errorMessage: ru.errorMsg}));
                fedBuilderData.push(React.createElement("td", {rowSpan: numSubFedBuilders}, (ru.rate / 1000).toFixed(3)));
                fedBuilderData.push(React.createElement("td", {rowSpan: numSubFedBuilders}, (ru.throughput / 1024 / 1024).toFixed(1)));
                fedBuilderData.push(React.createElement("td", {rowSpan: numSubFedBuilders}, (ru.superFragmentSizeMean / 1024).toFixed(1), "±", (ru.superFragmentSizeStddev / 1024).toFixed(1)));
                fedBuilderData.push(React.createElement("td", {rowSpan: numSubFedBuilders}, "evts"));
                fedBuilderData.push(React.createElement("td", {rowSpan: numSubFedBuilders}, ru.fragmentsInRU));
                fedBuilderData.push(React.createElement("td", {rowSpan: numSubFedBuilders}, ru.eventsInRU));
                fedBuilderData.push(React.createElement("td", {rowSpan: numSubFedBuilders}, ru.requests));
                var rowClassName = evenRow ? fbRowSubFbRowEvenClassName : fbRowSubFbRowOddClassName;
                var count = 0;
                subFedBuilders.forEach(function (subFedBuilder) { return rows.push(React.createElement(SubFEDBuilderRow, {additionalClasses: rowClassName, subFedBuilder: subFedBuilder, additionalContent: ++count == 1 ? fedBuilderData : null})); });
                evenRow = !evenRow;
            });
            var baseHeaders = ['T', '%W', '%B', 'frlpc',
                'geoSlot:SrcId      /      TTSOnlyFEDSrcId', 'min Trg',
                'max Trg', 'FB Name', 'RU', 'warn', 'rate (kHz)', 'thru (MB/s)',
                'size (kB)', '#events', '#frags in RU', '#evts in RU', '#requests'];
            var topHeaders = baseHeaders.slice();
            topHeaders.unshift('TTCP');
            var summaryHeaders = baseHeaders.slice();
            summaryHeaders.unshift('Summary');
            var fedBuilderSummary = this.props.fedBuilderSummary;
            var numRus = fedBuilders.length;
            return (React.createElement("table", {className: "fb-table"}, React.createElement("colgroup", {className: "fb-table-colgroup-fedbuilder", span: "9"}), React.createElement("colgroup", {className: "fb-table-colgroup-evb", span: "9"}), React.createElement("colgroup", {className: "fb-table-colgroup-unknown", span: "2"}), React.createElement("thead", {className: "fb-table-head"}, React.createElement(FEDBuilderTableTopHeaderRow, null), React.createElement(FEDBuilderTableHeaderRow, {headers: topHeaders})), React.createElement("tbody", {className: "fb-table-body"}, rows, React.createElement(FEDBuilderTableHeaderRow, {headers: summaryHeaders}), React.createElement(FEDBuilderTableSummaryRow, {fedBuilderSummary: fedBuilderSummary, numRus: numRus}))));
        };
        return FEDBuilderTableElement;
    }(React.Component));
    var FEDBuilderTableTopHeaderRow = (function (_super) {
        __extends(FEDBuilderTableTopHeaderRow, _super);
        function FEDBuilderTableTopHeaderRow() {
            _super.apply(this, arguments);
        }
        FEDBuilderTableTopHeaderRow.prototype.render = function () {
            return (React.createElement("tr", {className: "fb-table-top-header-row"}, React.createElement(FEDBuilderTableHeader, {additionalClasses: "fb-table-help", content: React.createElement("a", {href: "."}, "Table Help"), colSpan: "2"}), React.createElement(FEDBuilderTableHeader, {content: "F E D B U I L D E R", colSpan: "7"}), React.createElement(FEDBuilderTableHeader, {content: "E V B", colSpan: "9"})));
        };
        return FEDBuilderTableTopHeaderRow;
    }(React.Component));
    var FEDBuilderTableHeaderRow = (function (_super) {
        __extends(FEDBuilderTableHeaderRow, _super);
        function FEDBuilderTableHeaderRow() {
            _super.apply(this, arguments);
        }
        FEDBuilderTableHeaderRow.prototype.render = function () {
            var children = [];
            this.props.headers.forEach(function (header) { return children.push(React.createElement(FEDBuilderTableHeader, {content: header})); });
            return (React.createElement("tr", {className: "fb-table-header-row"}, children));
        };
        return FEDBuilderTableHeaderRow;
    }(React.Component));
    var FEDBuilderTableHeader = (function (_super) {
        __extends(FEDBuilderTableHeader, _super);
        function FEDBuilderTableHeader() {
            _super.apply(this, arguments);
        }
        FEDBuilderTableHeader.prototype.render = function () {
            var additionalClasses = this.props.additionalClasses;
            var className = classNames("fb-table-header", additionalClasses);
            return (React.createElement("th", {className: className, colSpan: this.props.colSpan ? this.props.colSpan : 1}, this.props.content));
        };
        return FEDBuilderTableHeader;
    }(React.Component));
    var RUMessages = (function (_super) {
        __extends(RUMessages, _super);
        function RUMessages() {
            _super.apply(this, arguments);
        }
        RUMessages.prototype.render = function () {
            return (React.createElement("td", {className: "fb-table-ru-messages", rowSpan: this.props.rowSpan ? this.props.rowSpan : 1}, React.createElement("span", {className: "fb-table-ru-error-message"}, this.props.errorMessage), React.createElement("span", {className: "fb-table-ru-warn-message"}, this.props.warnMessage), React.createElement("span", {className: "fb-table-ru-info-message"}, this.props.infoMessage)));
        };
        return RUMessages;
    }(React.Component));
    var SubFEDBuilderRow = (function (_super) {
        __extends(SubFEDBuilderRow, _super);
        function SubFEDBuilderRow() {
            _super.apply(this, arguments);
        }
        SubFEDBuilderRow.prototype.render = function () {
            var subFedBuilder = this.props.subFedBuilder;
            var frlPc = subFedBuilder.frlPc;
            var frlPcHostname = frlPc.hostname;
            var frlPcName = frlPcHostname.substring(0, frlPcHostname.length - 4);
            var frlPcUrl = frlPcHostname + ':11100';
            var frls = subFedBuilder.frls;
            var additionalClasses = this.props.additionalClasses;
            var className = classNames("fb-table-subfb-row", additionalClasses);
            var ttcPartition = subFedBuilder.ttcPartition;
            var ttsState = ttcPartition.ttsState ? ttcPartition.ttsState.substring(0, 1) : '-';
            var ttsStateClasses = ttcPartition.ttsState ? 'fb-table-subfb-tts-state-' + ttsState : 'fb-table-subfb-tts-state-none';
            ttsStateClasses = classNames(ttsStateClasses, 'fb-table-subfb-tts-state');
            return (React.createElement("tr", {className: className}, React.createElement("td", null, ttcPartition.name), React.createElement("td", null, React.createElement("span", {className: ttsStateClasses}, React.createElement("a", {href: (ttcPartition.fmm ? ttcPartition.fmm.url : '-'), target: "_blank"}, ttsState))), React.createElement("td", null, ttcPartition.percentWarning), React.createElement("td", null, ttcPartition.percentBusy), React.createElement("td", null, React.createElement("a", {href: frlPcUrl, target: "_blank"}, frlPcName)), React.createElement(FRLs, {frls: frls}), React.createElement("td", null, subFedBuilder.minTrig), React.createElement("td", null, subFedBuilder.maxTrig), this.props.additionalContent ? this.props.additionalContent : null));
        };
        return SubFEDBuilderRow;
    }(React.Component));
    var FRLs = (function (_super) {
        __extends(FRLs, _super);
        function FRLs() {
            _super.apply(this, arguments);
        }
        FRLs.prototype.render = function () {
            var frls = this.props.frls;
            var pseudoFEDs = [];
            var fedData = [];
            frls.forEach(function (frl) {
                fedData.push(React.createElement(FRL, {frl: frl}));
                console.log(frl.feds);
                DAQViewUtility.forEachOwnObjectProperty(frl.feds, function (slot) {
                    var fed = frl.feds[slot];
                    if (fed) {
                        pseudoFEDs.concat(fed.mainFeds);
                    }
                });
            });
            pseudoFEDs.forEach(function (fed) { return fedData.push(React.createElement(FEDData, {fed: fed})); });
            return (React.createElement("td", null, fedData));
        };
        return FRLs;
    }(React.Component));
    var FRL = (function (_super) {
        __extends(FRL, _super);
        function FRL() {
            _super.apply(this, arguments);
        }
        FRL.prototype.render = function () {
            var frl = this.props.frl;
            var feds = frl.feds;
            var firstFed = feds[0];
            var firstFedDisplay = firstFed ? React.createElement(FEDData, {fed: firstFed}) : '-';
            var secondFed = feds[1];
            var secondFedDisplay = secondFed ? React.createElement(FEDData, {fed: secondFed}) : '-';
            return (React.createElement("span", null, frl.geoSlot, ":", firstFedDisplay, ",", secondFedDisplay));
        };
        return FRL;
    }(React.Component));
    var FEDData = (function (_super) {
        __extends(FEDData, _super);
        function FEDData() {
            _super.apply(this, arguments);
        }
        FEDData.prototype.render = function () {
            var fed = this.props.fed;
            var percentWarning = fed.percentWarning;
            var percentBusy = fed.percentBusy;
            var ttsState = fed.ttsState ? fed.ttsState.substring(0, 1) : '';
            var percentBackpressure = fed.percentBackpressure;
            var expectedSourceId = fed.srcIdExpected;
            var receivedSourceId = fed.srcIdReceived;
            var fedCRCErrors = fed.numFRCerrors;
            var slinkCRCErrors = fed.numSCRCerrors;
            var percentWarningDisplay = percentWarning > 0 ?
                React.createElement("span", {className: "fb-table-fed-percent-warning"}, "W:", percentWarning.toFixed(1), "%") : '';
            var percentBusyDisplay = percentBusy > 0 ?
                React.createElement("span", {className: "fb-table-fed-percent-busy"}, "B:", percentBusy.toFixed(1), "%") : '';
            var ttsStateDisplay = (ttsState !== 'R' && ttsState.length !== 0) ? ttsState : '';
            var ttsStateClass;
            if (fed.fmmMasked === true) {
                ttsStateClass = 'fb-table-fed-tts-state-ffm-masked';
            }
            else {
                ttsStateClass = ttsStateDisplay.length !== 0 ? 'fb-table-fed-tts-state-' + ttsState : null;
            }
            var ttsStateClasses = classNames('fb-table-fed-tts-state', ttsStateClass);
            return (React.createElement("span", {className: "fb-table-fed"}, percentWarningDisplay, percentBusyDisplay, React.createElement("span", {className: ttsStateClasses}, ttsStateDisplay, expectedSourceId)));
        };
        return FEDData;
    }(React.Component));
    var FEDBuilderTableSummaryRow = (function (_super) {
        __extends(FEDBuilderTableSummaryRow, _super);
        function FEDBuilderTableSummaryRow() {
            _super.apply(this, arguments);
        }
        FEDBuilderTableSummaryRow.prototype.render = function () {
            var fedBuilderSummary = this.props.fedBuilderSummary;
            return (React.createElement("tr", {className: "fb-table-fb-summary-row"}, React.createElement("td", {colSpan: "9"}), React.createElement("td", null, "Σ x / ", this.props.numRus), React.createElement("td", null), React.createElement("td", null, (fedBuilderSummary.rate / 1000).toFixed(3)), React.createElement("td", null, "Σ ", (fedBuilderSummary.throughput / 1024 / 1024).toFixed(1)), React.createElement("td", null, "Σ ", (fedBuilderSummary.superFragmentSizeMean / 1024).toFixed(1), "±", (fedBuilderSummary.superFragmentSizeStddev / 1024).toFixed(1)), React.createElement("td", null, "Δ ", fedBuilderSummary.deltaEvents), React.createElement("td", null, "Σ ", FormatUtility.formatSINumber(fedBuilderSummary.sumFragmentsInRU, 1)), React.createElement("td", null, "Σ ", fedBuilderSummary.sumEventsInRU), React.createElement("td", null, "Σ ", fedBuilderSummary.sumRequests)));
        };
        return FEDBuilderTableSummaryRow;
    }(React.Component));
})(DAQView || (DAQView = {}));
//# sourceMappingURL=fb-table.js.map