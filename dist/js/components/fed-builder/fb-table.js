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
            this.sortFunction = FBTableSortFunctions.TTCP_ASC;
            this.currentSorting = {
                'TTCP': DAQView.Sorting.Ascending,
                'FB Name': DAQView.Sorting.None,
                '%W': DAQView.Sorting.None,
                '%B': DAQView.Sorting.None,
                'RU': DAQView.Sorting.None,
                'warn': DAQView.Sorting.None,
                'rate (kHz)': DAQView.Sorting.None,
                'thru (MB/s)': DAQView.Sorting.None,
                'size (kB)': DAQView.Sorting.None,
                '#events': DAQView.Sorting.None,
                '#frags in RU': DAQView.Sorting.None,
                '#evts in RU': DAQView.Sorting.None,
                '#requests': DAQView.Sorting.None
            };
            this.htmlRootElement = document.getElementById(htmlRootElementName);
        }
        FEDBuilderTable.prototype.setSnapshot = function (snapshot) {
            this.snapshot = snapshot;
            var sortedSnapshot = this.sort(snapshot);
            var daq = sortedSnapshot.getDAQ();
            var fedBuilderTableRootElement = React.createElement(FEDBuilderTableElement, {tableObject: this, fedBuilders: daq.fedBuilders, fedBuilderSummary: daq.fedBuilderSummary});
            ReactDOM.render(fedBuilderTableRootElement, this.htmlRootElement);
        };
        FEDBuilderTable.prototype.setSortFunction = function (sortFunction) {
            this.sortFunction = sortFunction;
            this.setSnapshot(this.snapshot);
        };
        FEDBuilderTable.prototype.sort = function (snapshot) {
            return this.sortFunction(snapshot);
        };
        FEDBuilderTable.prototype.setCurrentSorting = function (headerName, sorting) {
            var _this = this;
            DAQViewUtility.forEachOwnObjectProperty(this.currentSorting, function (header) { return _this.currentSorting[header] = DAQView.Sorting.None; });
            this.currentSorting[headerName] = sorting;
        };
        FEDBuilderTable.prototype.getCurrentSorting = function (headerName) {
            return this.currentSorting[headerName];
        };
        return FEDBuilderTable;
    }());
    DAQView.FEDBuilderTable = FEDBuilderTable;
    var FBTableNumberFormats;
    (function (FBTableNumberFormats) {
        FBTableNumberFormats.RATE = {
            baseStyle: 'fb-table-rate',
            formats: [{ min: 0, max: 0, styleSuffix: '-zero' }, { styleSuffix: '-nonzero' }]
        };
        FBTableNumberFormats.THROUGHPUT = {
            baseStyle: 'fb-table-throughput',
            formats: [{ min: 0, max: 0, styleSuffix: '-zero' }, { styleSuffix: '-nonzero' }]
        };
        FBTableNumberFormats.SIZE = {
            baseStyle: 'fb-table-size',
            formats: [{ min: 0, max: 0, styleSuffix: '-zero' }, { styleSuffix: '-nonzero' }]
        };
        FBTableNumberFormats.EVENTS = {
            baseStyle: 'fb-table-events'
        };
        FBTableNumberFormats.FRAGMENTS_IN_RU = {
            baseStyle: 'fb-table-fragments-in-ru'
        };
        FBTableNumberFormats.EVENTS_IN_RU = {
            baseStyle: 'fb-table-events-in-ru'
        };
        FBTableNumberFormats.REQUESTS = {
            baseStyle: 'fb-table-requests'
        };
    })(FBTableNumberFormats = DAQView.FBTableNumberFormats || (DAQView.FBTableNumberFormats = {}));
    var FBTableSortFunctions;
    (function (FBTableSortFunctions) {
        function NONE(snapshot) {
            return snapshot;
        }
        FBTableSortFunctions.NONE = NONE;
        function SubFBByTTCP(snapshot, descending) {
            var daq = snapshot.getDAQ();
            var fedBuilders = daq.fedBuilders;
            // sort the SubFEDBuilders of each FEDBuilder by their TTCP name
            fedBuilders.forEach(function (fedBuilder) {
                fedBuilder.subFedbuilders.sort(function (firstSubFedBuilder, secondSubFedBuilder) {
                    var firstSubFedBuilderTTCPName = firstSubFedBuilder.ttcPartition.name;
                    var secondSubFedBuilderTTCPName = secondSubFedBuilder.ttcPartition.name;
                    if (firstSubFedBuilderTTCPName > secondSubFedBuilderTTCPName) {
                        return (descending ? -1 : 1);
                    }
                    else if (firstSubFedBuilderTTCPName < secondSubFedBuilderTTCPName) {
                        return (descending ? 1 : -1);
                    }
                    else {
                        return 0;
                    }
                });
            });
            return snapshot;
        }
        function TTCP(snapshot, descending) {
            snapshot = SubFBByTTCP(snapshot, descending);
            var daq = snapshot.getDAQ();
            var fedBuilders = daq.fedBuilders;
            // sort the FEDBuilders based on their first SubFEDBuilders TTCP name
            fedBuilders.sort(function (firstFedBuilder, secondFedBuilder) {
                if (firstFedBuilder.ru.isEVM) {
                    return -1;
                }
                else if (secondFedBuilder.ru.isEVM) {
                    return 1;
                }
                var firstFedBuilderFirstTTCPName = firstFedBuilder.subFedbuilders[0].ttcPartition.name;
                var secondFedBuilderFirstTTCPName = secondFedBuilder.subFedbuilders[0].ttcPartition.name;
                if (firstFedBuilderFirstTTCPName > secondFedBuilderFirstTTCPName) {
                    return (descending ? -1 : 1);
                }
                else if (firstFedBuilderFirstTTCPName < secondFedBuilderFirstTTCPName) {
                    return (descending ? 1 : -1);
                }
                else {
                    // if the first TTCP name of both FEDBuilders is the same, sort by FEDBuilder name
                    var firstFedBuilderName = firstFedBuilder.name;
                    var secondFedBuilderName = secondFedBuilder.name;
                    if (firstFedBuilderName > secondFedBuilderName) {
                        return (descending ? -1 : 1);
                    }
                    else if (firstFedBuilderName < secondFedBuilderName) {
                        return (descending ? 1 : -1);
                    }
                    else {
                        return 0;
                    }
                }
            });
            return snapshot;
        }
        function TTCP_ASC(snapshot) {
            return TTCP(snapshot, false);
        }
        FBTableSortFunctions.TTCP_ASC = TTCP_ASC;
        function TTCP_DESC(snapshot) {
            return TTCP(snapshot, true);
        }
        FBTableSortFunctions.TTCP_DESC = TTCP_DESC;
        function FB(snapshot, descending) {
            snapshot = SubFBByTTCP(snapshot, descending);
            var daq = snapshot.getDAQ();
            var fedBuilders = daq.fedBuilders;
            // sort by FEDBuilder name
            fedBuilders.sort(function (firstFedBuilder, secondFedBuilder) {
                if (firstFedBuilder.ru.isEVM) {
                    return -1;
                }
                else if (secondFedBuilder.ru.isEVM) {
                    return 1;
                }
                var firstFedBuilderName = firstFedBuilder.name;
                var secondFedBuilderName = secondFedBuilder.name;
                if (firstFedBuilderName > secondFedBuilderName) {
                    return (descending ? -1 : 1);
                }
                else if (firstFedBuilderName < secondFedBuilderName) {
                    return (descending ? 1 : -1);
                }
                else {
                    return 0;
                }
            });
            return snapshot;
        }
        function FB_ASC(snapshot) {
            return FB(snapshot, false);
        }
        FBTableSortFunctions.FB_ASC = FB_ASC;
        function FB_DESC(snapshot) {
            return FB(snapshot, true);
        }
        FBTableSortFunctions.FB_DESC = FB_DESC;
    })(FBTableSortFunctions = DAQView.FBTableSortFunctions || (DAQView.FBTableSortFunctions = {}));
    var FEDBuilderTableElement = (function (_super) {
        __extends(FEDBuilderTableElement, _super);
        function FEDBuilderTableElement() {
            _super.apply(this, arguments);
        }
        FEDBuilderTableElement.prototype.render = function () {
            var fedBuilders = this.props.fedBuilders;
            var evmMaxTrg = null;
            fedBuilders.forEach(function (fedBuilder) {
                if (fedBuilder.ru && fedBuilder.ru.isEVM) {
                    if (fedBuilder.subFedbuilders && fedBuilder.subFedbuilders.length > 0) {
                        evmMaxTrg = fedBuilder.subFedbuilders[0].maxTrig;
                    }
                }
            });
            var fedBuilderRows = [];
            fedBuilders.forEach(function (fedBuilder) {
                fedBuilderRows.push(React.createElement(FEDBuilderRow, {fedBuilder: fedBuilder, evmMaxTrg: evmMaxTrg}));
            });
            var baseHeaders = [
                { content: 'T' },
                { content: '%W' },
                { content: '%B' },
                { content: 'frlpc' },
                { content: 'geoSlot:SrcId      /      TTSOnlyFEDSrcId' },
                { content: 'min Trg' },
                { content: 'max Trg' },
                {
                    content: 'FB Name',
                    sortFunctions: {
                        Ascending: FBTableSortFunctions.FB_ASC,
                        Descending: FBTableSortFunctions.FB_DESC
                    }
                },
                { content: 'RU' },
                { content: 'warn' },
                { content: 'rate (kHz)' },
                { content: 'thru (MB/s)' },
                { content: 'size (kB)' },
                { content: '#events' },
                { content: '#frags in RU' },
                { content: '#evts in RU' },
                { content: '#requests' }
            ];
            var topHeaders = baseHeaders.slice();
            topHeaders.unshift({
                content: 'TTCP',
                sortFunctions: {
                    Ascending: FBTableSortFunctions.TTCP_ASC,
                    Descending: FBTableSortFunctions.TTCP_DESC
                }
            });
            var summaryHeaders = baseHeaders.slice();
            summaryHeaders.unshift({ content: 'Summary' });
            var fedBuilderSummary = this.props.fedBuilderSummary;
            var numRus = fedBuilders.length;
            var tableObject = this.props.tableObject;
            return (React.createElement("table", {className: "fb-table"}, React.createElement("colgroup", {className: "fb-table-colgroup-fedbuilder", span: "9"}), React.createElement("colgroup", {className: "fb-table-colgroup-evb", span: "9"}), React.createElement("colgroup", {className: "fb-table-colgroup-unknown", span: "2"}), React.createElement("thead", {className: "fb-table-head"}, React.createElement(FEDBuilderTableTopHeaderRow, null), React.createElement(FEDBuilderTableHeaderRow, {tableObject: tableObject, headers: topHeaders})), fedBuilderRows, React.createElement("tfoot", {className: "fb-table-foot"}, React.createElement(FEDBuilderTableHeaderRow, {tableObject: tableObject, headers: summaryHeaders}), React.createElement(FEDBuilderTableSummaryRow, {fedBuilderSummary: fedBuilderSummary, numRus: numRus}))));
        };
        return FEDBuilderTableElement;
    }(React.Component));
    var FEDBuilderRow = (function (_super) {
        __extends(FEDBuilderRow, _super);
        function FEDBuilderRow() {
            _super.apply(this, arguments);
        }
        FEDBuilderRow.prototype.render = function () {
            var _this = this;
            var fedBuilder = this.props.fedBuilder;
            var subFedBuilders = fedBuilder.subFedbuilders;
            var numSubFedBuilders = subFedBuilders.length;
            var ru = fedBuilder.ru;
            var ruHostname = ru.hostname;
            var ruName = ruHostname.substring(3, ruHostname.length - 4);
            var ruUrl = 'http://' + ruHostname + ':11100/urn:xdaq-application:service=' + (ru.isEVM ? 'evm' : 'ru');
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
            var fbRowClassName = classNames("fb-table-fb-row", this.props.additionalClasses);
            var children = [];
            var count = 0;
            subFedBuilders.forEach(function (subFedBuilder) { return children.push(React.createElement(SubFEDBuilderRow, {evmMaxTrg: _this.props.evmMaxTrg, subFedBuilder: subFedBuilder, additionalContent: ++count == 1 ? fedBuilderData : null})); });
            return (React.createElement("tbody", {className: fbRowClassName}, children));
        };
        return FEDBuilderRow;
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
            var tableObject = this.props.tableObject;
            var children = [];
            this.props.headers.forEach(function (header) { return children.push(React.createElement(FEDBuilderTableHeader, {content: header.content, colSpan: header.colSpan, additionalClasses: header.additionalClasses, tableObject: tableObject, sortFunctions: header.sortFunctions})); });
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
            var content = this.props.content;
            var colSpan = this.props.colSpan;
            var additionalClasses = this.props.additionalClasses;
            var className = classNames("fb-table-header", additionalClasses);
            var tableObject = this.props.tableObject;
            var currentSorting;
            var sortFunctions = this.props.sortFunctions;
            if (tableObject && sortFunctions) {
                currentSorting = tableObject.getCurrentSorting(content);
            }
            var clickFunction = null;
            if (tableObject && sortFunctions) {
                if (currentSorting === DAQView.Sorting.None || currentSorting === DAQView.Sorting.Descending) {
                    clickFunction = function () {
                        tableObject.setSortFunction.bind(tableObject)(sortFunctions[DAQView.Sorting.Ascending.toString()]);
                        tableObject.setCurrentSorting.bind(tableObject)(content, DAQView.Sorting.Ascending);
                    };
                }
                else if (currentSorting === DAQView.Sorting.Ascending) {
                    clickFunction = function () {
                        tableObject.setSortFunction.bind(tableObject)(sortFunctions[DAQView.Sorting.Descending.toString()]);
                        tableObject.setCurrentSorting.bind(tableObject)(content, DAQView.Sorting.Descending);
                    };
                }
            }
            var sortingImage = null;
            if (currentSorting) {
                sortingImage = React.createElement("input", {type: "image", className: "fb-table-sort-image", src: 'dist/img/' + currentSorting.getImagePath(), alt: currentSorting.toString(), title: "Sort", onClick: clickFunction});
            }
            return (React.createElement("th", {className: className, colSpan: colSpan ? colSpan : "1"}, content, sortingImage));
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
            var frlPcName = frlPcHostname.substring(6, frlPcHostname.length - 4);
            var frlPcUrl = 'http://' + frlPcHostname + ':11100';
            var frls = subFedBuilder.frls;
            var additionalClasses = this.props.additionalClasses;
            var className = classNames("fb-table-subfb-row", additionalClasses);
            var ttcPartition = subFedBuilder.ttcPartition;
            var ttsState = ttcPartition.ttsState ? ttcPartition.ttsState.substring(0, 1) : '-';
            var ttsStateClasses = ttcPartition.ttsState ? 'fb-table-subfb-tts-state-' + ttsState : 'fb-table-subfb-tts-state-none';
            ttsStateClasses = classNames(ttsStateClasses, 'fb-table-subfb-tts-state');
            var minTrig = subFedBuilder.minTrig;
            var maxTrig = subFedBuilder.maxTrig;
            var minTrigUnequalMaxTrig = minTrig != maxTrig;
            var ttcPartitionTTSStateLink = ttsState;
            if (ttcPartition.fmm) {
                ttcPartitionTTSStateLink = React.createElement("a", {href: ttcPartition.fmm.url, target: "_blank"}, ttsState);
            }
            var ttcPartitionTTSStateDisplay = React.createElement("span", {className: ttsStateClasses}, ttcPartitionTTSStateLink);
            var evmMaxTrg = this.props.evmMaxTrg;
            var minTrigDisplayContent = '';
            var maxTrigDisplayContent = maxTrig;
            if (minTrigUnequalMaxTrig) {
                minTrigDisplayContent = minTrig;
            }
            var minTrigClassNames = 'fb-table-subfb-min-trig';
            var maxTrigClassNames = 'fb-table-subfb-max-trig';
            if (evmMaxTrg) {
                if (minTrig != evmMaxTrg && minTrigUnequalMaxTrig) {
                    minTrigClassNames = classNames(minTrigClassNames, minTrigClassNames + '-unequal');
                }
                else {
                    minTrigClassNames = classNames(minTrigClassNames, minTrigClassNames + '-equal');
                }
                if (maxTrig != evmMaxTrg) {
                    maxTrigClassNames = classNames(maxTrigClassNames, maxTrigClassNames + '-unequal');
                }
                else {
                    maxTrigClassNames = classNames(maxTrigClassNames, maxTrigClassNames + '-equal');
                }
            }
            return (React.createElement("tr", {className: className}, React.createElement("td", null, ttcPartition.name), React.createElement("td", null, ttcPartitionTTSStateDisplay), React.createElement("td", null, ttcPartition.percentWarning), React.createElement("td", null, ttcPartition.percentBusy), React.createElement("td", null, React.createElement("a", {href: frlPcUrl, target: "_blank"}, frlPcName)), React.createElement(FRLs, {frls: frls}), React.createElement("td", {className: minTrigClassNames}, minTrigDisplayContent), React.createElement("td", {className: maxTrigClassNames}, maxTrigDisplayContent), this.props.additionalContent ? this.props.additionalContent : null));
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
            var firstFrl = true;
            frls.forEach(function (frl) {
                fedData.push(React.createElement(FRL, {frl: frl, firstFrl: firstFrl}));
                firstFrl = false;
                DAQViewUtility.forEachOwnObjectProperty(frl.feds, function (slot) {
                    var fed = frl.feds[slot];
                    if (fed) {
                        pseudoFEDs = pseudoFEDs.concat(fed.mainFeds);
                    }
                });
            });
            pseudoFEDs.forEach(function (fed) {
                fedData.push(' ');
                fedData.push(React.createElement(FEDData, {fed: fed}));
            });
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
            var secondFedDisplay = secondFed ? React.createElement(FEDData, {fed: secondFed}) : '';
            var firstFrl = this.props.firstFrl;
            return (React.createElement("span", null, firstFrl ? '' : ', ', frl.geoSlot, ":", firstFedDisplay, secondFed ? ',' : '', secondFedDisplay));
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
            var percentBackpressureDisplay = percentBackpressure > 0 ?
                React.createElement("span", {className: "fb-table-fed-percent-backpressure"}, '<', percentWarning.toFixed(1), "%") : '';
            var unexpectedSourceIdDisplay = '';
            if (receivedSourceId != expectedSourceId) {
                unexpectedSourceIdDisplay =
                    React.createElement("span", {className: "fb-table-fed-received-source-id"}, "rcvSrcId:", receivedSourceId);
            }
            var fedCRCErrorDisplay = fedCRCErrors > 0 ?
                React.createElement("span", {className: "fb-table-fed-crc-errors"}, "#FCRC=", fedCRCErrors) : '';
            var slinkCRCErrorDisplay = slinkCRCErrors > 0 ?
                React.createElement("span", {className: "fb-table-slink-crc-errors"}, "#SCRC=", slinkCRCErrors) : '';
            return (React.createElement("span", {className: "fb-table-fed"}, percentWarningDisplay, percentBusyDisplay, React.createElement("span", {className: ttsStateClasses}, ttsStateDisplay, expectedSourceId), percentBackpressureDisplay, unexpectedSourceIdDisplay, fedCRCErrorDisplay, slinkCRCErrorDisplay));
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
