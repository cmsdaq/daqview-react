"use strict";
/**
 * @author Michail Vougioukas
 * @author Philipp Brummer
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
    var FEDBuilderTable = (function () {
        function FEDBuilderTable(htmlRootElementName) {
            this.DEFAULT_PRESORT_FUNCTION = FBTableSortFunctions.TTCP_ASC;
            this.INITIAL_SORT_FUNCTION = FBTableSortFunctions.TTCP_ASC;
            this.INITIAL_PRESORT_FUNCTION = FBTableSortFunctions.NONE;
            this.snapshot = null;
            this.drawPausedComponent = false;
            this.drawZeroDataFlowComponent = false;
            this.drawStaleSnapshot = false;
            this.previousPauseState = false;
            this.sortFunction = {
                presort: this.INITIAL_PRESORT_FUNCTION,
                sort: this.INITIAL_SORT_FUNCTION
            };
            //columns stored here will get a sort icon
            this.currentSorting = {
                'TTCP': DAQView.Sorting.Ascending,
                'FB Name': DAQView.Sorting.None,
                '%W': DAQView.Sorting.None,
                '%B': DAQView.Sorting.None,
                'RU': DAQView.Sorting.None,
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
        FEDBuilderTable.prototype.setSnapshot = function (snapshot, drawPausedComponent, drawZeroDataFlowComponent, drawStaleSnapshot, url) {
            if (!snapshot) {
                var msg = "";
                var errRootElement = React.createElement(ErrorElement, { message: msg });
                ReactDOM.render(errRootElement, this.htmlRootElement);
            }
            else {
                if (this.snapshot != null && this.snapshot.getUpdateTimestamp() === snapshot.getUpdateTimestamp()) {
                    console.log("duplicate snapshot detected");
                    if (drawPausedComponent || drawZeroDataFlowComponent || drawStaleSnapshot) {
                        console.log("...but page color has to change, so do render");
                    }
                    else {
                        return;
                    }
                }
                this.snapshot = FBTableSortFunctions.STATIC(snapshot);
                this.drawPausedComponent = drawPausedComponent;
                this.drawZeroDataFlowComponent = drawZeroDataFlowComponent;
                this.drawStaleSnapshot = drawStaleSnapshot;
                this.updateSnapshot();
            }
        };
        //to be called before setSnapshot
        FEDBuilderTable.prototype.prePassElementSpecificData = function (args) {
        };
        FEDBuilderTable.prototype.updateSnapshot = function () {
            var sortedSnapshot = this.sort(this.snapshot);
            var daq = sortedSnapshot.getDAQ();
            var drawPausedComponent = this.drawPausedComponent;
            var drawZeroDataFlowComponent = this.drawZeroDataFlowComponent;
            var drawStaleSnapshot = this.drawStaleSnapshot;
            var tcdsControllerUrl = daq.tcdsGlobalInfo.tcdsControllerContext;
            var tcdsControllerServiceName = daq.tcdsGlobalInfo.tcdsControllerServiceName;
            var fedBuilderTableRootElement = React.createElement(FEDBuilderTableElement, { tableObject: this, fedBuilders: daq.fedBuilders, fedBuilderSummary: daq.fedBuilderSummary, drawPausedComponent: drawPausedComponent, drawZeroDataFlowComponent: drawZeroDataFlowComponent, tcdsControllerUrl: tcdsControllerUrl, tcdsControllerServiceName: tcdsControllerServiceName, drawStaleSnapshot: drawStaleSnapshot });
            ReactDOM.render(fedBuilderTableRootElement, this.htmlRootElement);
        };
        FEDBuilderTable.prototype.setSortFunction = function (sortFunctions) {
            var presortFunction;
            var sortFunction;
            if (sortFunctions.hasOwnProperty('presort')) {
                presortFunction = sortFunctions.presort;
            }
            else {
                presortFunction = this.DEFAULT_PRESORT_FUNCTION;
            }
            sortFunction = sortFunctions.sort;
            this.sortFunction = { presort: presortFunction, sort: sortFunction };
            this.updateSnapshot();
        };
        FEDBuilderTable.prototype.sort = function (snapshot) {
            return this.sortFunction.sort(this.sortFunction.presort(snapshot));
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
    var ErrorElement = (function (_super) {
        __extends(ErrorElement, _super);
        function ErrorElement() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        ErrorElement.prototype.render = function () {
            return (React.createElement("div", null, this.props.message));
        };
        return ErrorElement;
    }(React.Component));
    var FBTableNumberFormats;
    (function (FBTableNumberFormats) {
        FBTableNumberFormats.RATE = {
            baseStyle: 'fb-table-ru-rate',
            formats: [{ min: 0, max: 0, styleSuffix: '-zero' }, { styleSuffix: '-nonzero' }]
        };
        FBTableNumberFormats.THROUGHPUT = {
            baseStyle: 'fb-table-ru-throughput',
            formats: [{ min: 0, max: 0, styleSuffix: '-zero' }, { styleSuffix: '-nonzero' }]
        };
        FBTableNumberFormats.SIZE = {
            baseStyle: 'fb-table-ru-size'
        };
        FBTableNumberFormats.EVENTS = {
            baseStyle: 'fb-table-ru-events',
            formats: [{ min: 0, max: 0, styleSuffix: '-zero' }, { styleSuffix: '-nonzero' }]
        };
        FBTableNumberFormats.FRAGMENTS_IN_RU = {
            baseStyle: 'fb-table-ru-fragments-in-ru',
        };
        FBTableNumberFormats.EVENTS_IN_RU = {
            baseStyle: 'fb-table-ru-events-in-ru',
        };
        FBTableNumberFormats.REQUESTS = {
            baseStyle: 'fb-table-ru-requests',
        };
    })(FBTableNumberFormats = DAQView.FBTableNumberFormats || (DAQView.FBTableNumberFormats = {}));
    var FBTableSortFunctions;
    (function (FBTableSortFunctions) {
        function NONE(snapshot) {
            return snapshot;
        }
        FBTableSortFunctions.NONE = NONE;
        function STATIC(snapshot) {
            snapshot = SubFbPseudoFEDsById(snapshot, false);
            return FrlsByGeoslot(snapshot, false);
        }
        FBTableSortFunctions.STATIC = STATIC;
        function FedsById(feds, descending) {
            feds.sort(function (firstFed, secondFed) {
                var firstFedId = firstFed.srcIdExpected;
                var secondFedId = secondFed.srcIdExpected;
                if (firstFedId > secondFedId) {
                    return (descending ? -1 : 1);
                }
                else if (firstFedId < secondFedId) {
                    return (descending ? 1 : -1);
                }
                else {
                    return 0;
                }
            });
        }
        FBTableSortFunctions.FedsById = FedsById;
        function SubFbPseudoFEDsById(snapshot, descending) {
            var daq = snapshot.getDAQ();
            var fedBuilders = daq.fedBuilders;
            fedBuilders.forEach(function (fedBuilder) {
                fedBuilder.subFedbuilders.forEach(function (subFedBuilder) {
                    FedsById(subFedBuilder.feds, descending);
                });
            });
            return snapshot;
        }
        function FrlsByGeoslot(snapshot, descending) {
            var daq = snapshot.getDAQ();
            var fedBuilders = daq.fedBuilders;
            // sort the FRLs of each SubFEDBuilder, of each FEDBuilder by their FRL geoslot
            fedBuilders.forEach(function (fedBuilder) {
                fedBuilder.subFedbuilders.forEach(function (subFEDBuilder) {
                    subFEDBuilder.frls.sort(function (firstFrl, secondFrl) {
                        var firstFrlGeoslot = firstFrl.geoSlot;
                        var secondFrlGeoslot = secondFrl.geoSlot;
                        if (firstFrlGeoslot > secondFrlGeoslot) {
                            return (descending ? -1 : 1);
                        }
                        else if (firstFrlGeoslot < secondFrlGeoslot) {
                            return (descending ? 1 : -1);
                        }
                        else {
                            return 0;
                        }
                    });
                });
            });
            return snapshot;
        }
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
        function SubFBByPERCBusy(snapshot, descending) {
            var daq = snapshot.getDAQ();
            var fedBuilders = daq.fedBuilders;
            // sort the SubFEDBuilders of each FEDBuilder by their TTS percentage busy
            fedBuilders.forEach(function (fedBuilder) {
                fedBuilder.subFedbuilders.sort(function (firstSubFedBuilder, secondSubFedBuilder) {
                    var firstSubFedBuilderTTSBusy = firstSubFedBuilder.ttcPartition.percentBusy;
                    var secondSubFedBuilderTTSBusy = secondSubFedBuilder.ttcPartition.percentBusy;
                    if (firstSubFedBuilderTTSBusy > secondSubFedBuilderTTSBusy) {
                        return (descending ? -1 : 1);
                    }
                    else if (firstSubFedBuilderTTSBusy < secondSubFedBuilderTTSBusy) {
                        return (descending ? 1 : -1);
                    }
                    else {
                        return 0;
                    }
                });
            });
            return snapshot;
        }
        function SubFBByPERCWarning(snapshot, descending) {
            var daq = snapshot.getDAQ();
            var fedBuilders = daq.fedBuilders;
            // sort the SubFEDBuilders of each FEDBuilder by their TTS percentage warning
            fedBuilders.forEach(function (fedBuilder) {
                fedBuilder.subFedbuilders.sort(function (firstSubFedBuilder, secondSubFedBuilder) {
                    var firstSubFedBuilderTTSWarning = firstSubFedBuilder.ttcPartition.percentWarning;
                    var secondSubFedBuilderTTSWarning = secondSubFedBuilder.ttcPartition.percentWarning;
                    if (firstSubFedBuilderTTSWarning > secondSubFedBuilderTTSWarning) {
                        return (descending ? -1 : 1);
                    }
                    else if (firstSubFedBuilderTTSWarning < secondSubFedBuilderTTSWarning) {
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
                    // if the first TTCP name of both FEDBuilders is the same, sort
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
        function PERCBUSY(snapshot, descending) {
            snapshot = SubFBByPERCBusy(snapshot, true); //returns subFEDBuilders in each FEDBuildder, sorted by decreasing TTS busy percentage
            var daq = snapshot.getDAQ();
            var fedBuilders = daq.fedBuilders;
            // sort the FEDBuilders based on their top subFEDBuilder's TTCP busy status percentage
            fedBuilders.sort(function (firstFedBuilder, secondFedBuilder) {
                if (firstFedBuilder.ru.isEVM) {
                    return -1;
                }
                else if (secondFedBuilder.ru.isEVM) {
                    return 1;
                }
                var firstFedBuilderFirstTTCPBusy = firstFedBuilder.subFedbuilders[0].ttcPartition.percentBusy;
                var secondFedBuilderFirstTTCPBusy = secondFedBuilder.subFedbuilders[0].ttcPartition.percentBusy;
                if (firstFedBuilderFirstTTCPBusy > secondFedBuilderFirstTTCPBusy) {
                    return (descending ? -1 : 1);
                }
                else if (firstFedBuilderFirstTTCPBusy < secondFedBuilderFirstTTCPBusy) {
                    return (descending ? 1 : -1);
                }
                else {
                    return 0;
                }
            });
            return snapshot;
        }
        function PERCBUSY_ASC(snapshot) {
            return PERCBUSY(snapshot, false);
        }
        FBTableSortFunctions.PERCBUSY_ASC = PERCBUSY_ASC;
        function PERCBUSY_DESC(snapshot) {
            return PERCBUSY(snapshot, true);
        }
        FBTableSortFunctions.PERCBUSY_DESC = PERCBUSY_DESC;
        function PERCWARNING(snapshot, descending) {
            snapshot = SubFBByPERCWarning(snapshot, true); //returns subFEDBuilders in each FEDBuildder, sorted by decreasing TTS warning percentage
            var daq = snapshot.getDAQ();
            var fedBuilders = daq.fedBuilders;
            // sort the FEDBuilders based on their top subFEDBuilder's TTCP warning status percentage
            fedBuilders.sort(function (firstFedBuilder, secondFedBuilder) {
                if (firstFedBuilder.ru.isEVM) {
                    return -1;
                }
                else if (secondFedBuilder.ru.isEVM) {
                    return 1;
                }
                var firstFedBuilderFirstTTCPWarning = firstFedBuilder.subFedbuilders[0].ttcPartition.percentWarning;
                var secondFedBuilderFirstTTCPWarning = secondFedBuilder.subFedbuilders[0].ttcPartition.percentWarning;
                if (firstFedBuilderFirstTTCPWarning > secondFedBuilderFirstTTCPWarning) {
                    return (descending ? -1 : 1);
                }
                else if (firstFedBuilderFirstTTCPWarning < secondFedBuilderFirstTTCPWarning) {
                    return (descending ? 1 : -1);
                }
                else {
                    return 0;
                }
            });
            return snapshot;
        }
        function PERCWARNING_ASC(snapshot) {
            return PERCWARNING(snapshot, false);
        }
        FBTableSortFunctions.PERCWARNING_ASC = PERCWARNING_ASC;
        function PERCWARNING_DESC(snapshot) {
            return PERCWARNING(snapshot, true);
        }
        FBTableSortFunctions.PERCWARNING_DESC = PERCWARNING_DESC;
        function RURATE(snapshot, descending) {
            var daq = snapshot.getDAQ();
            var fedBuilders = daq.fedBuilders;
            // sort the FEDBuilders based on their RU rate
            fedBuilders.sort(function (firstFedBuilder, secondFedBuilder) {
                if (firstFedBuilder.ru.isEVM) {
                    return -1;
                }
                else if (secondFedBuilder.ru.isEVM) {
                    return 1;
                }
                var firstFedBuilderRURate = firstFedBuilder.ru.rate;
                var secondFedBuilderRURate = secondFedBuilder.ru.rate;
                if (firstFedBuilderRURate > secondFedBuilderRURate) {
                    return (descending ? -1 : 1);
                }
                else if (firstFedBuilderRURate < secondFedBuilderRURate) {
                    return (descending ? 1 : -1);
                }
                else {
                    return 0;
                }
            });
            return snapshot;
        }
        function RUHOSTNAME(snapshot, descending) {
            var daq = snapshot.getDAQ();
            var fedBuilders = daq.fedBuilders;
            // sort the FEDBuilders based on their RU throughput
            fedBuilders.sort(function (firstFedBuilder, secondFedBuilder) {
                if (firstFedBuilder.ru.isEVM) {
                    return -1;
                }
                else if (secondFedBuilder.ru.isEVM) {
                    return 1;
                }
                var firstFedBuilderRUHostname = firstFedBuilder.ru.hostname;
                var secondFedBuilderRUHostname = secondFedBuilder.ru.hostname;
                if (firstFedBuilderRUHostname > secondFedBuilderRUHostname) {
                    return (descending ? -1 : 1);
                }
                else if (firstFedBuilderRUHostname < secondFedBuilderRUHostname) {
                    return (descending ? 1 : -1);
                }
                else {
                    return 0;
                }
            });
            return snapshot;
        }
        function RU_HOSTNAME_ASC(snapshot) {
            return RUHOSTNAME(snapshot, false);
        }
        FBTableSortFunctions.RU_HOSTNAME_ASC = RU_HOSTNAME_ASC;
        function RU_HOSTNAME_DESC(snapshot) {
            return RUHOSTNAME(snapshot, true);
        }
        FBTableSortFunctions.RU_HOSTNAME_DESC = RU_HOSTNAME_DESC;
        function RURATE_ASC(snapshot) {
            return RURATE(snapshot, false);
        }
        FBTableSortFunctions.RURATE_ASC = RURATE_ASC;
        function RURATE_DESC(snapshot) {
            return RURATE(snapshot, true);
        }
        FBTableSortFunctions.RURATE_DESC = RURATE_DESC;
        function RUTHROUGHPUT(snapshot, descending) {
            var daq = snapshot.getDAQ();
            var fedBuilders = daq.fedBuilders;
            // sort the FEDBuilders based on their RU throughput
            fedBuilders.sort(function (firstFedBuilder, secondFedBuilder) {
                if (firstFedBuilder.ru.isEVM) {
                    return -1;
                }
                else if (secondFedBuilder.ru.isEVM) {
                    return 1;
                }
                var firstFedBuilderRUThroughput = firstFedBuilder.ru.throughput;
                var secondFedBuilderRUThroughput = secondFedBuilder.ru.throughput;
                if (firstFedBuilderRUThroughput > secondFedBuilderRUThroughput) {
                    return (descending ? -1 : 1);
                }
                else if (firstFedBuilderRUThroughput < secondFedBuilderRUThroughput) {
                    return (descending ? 1 : -1);
                }
                else {
                    return 0;
                }
            });
            return snapshot;
        }
        function RUTHROUGHPUT_ASC(snapshot) {
            return RUTHROUGHPUT(snapshot, false);
        }
        FBTableSortFunctions.RUTHROUGHPUT_ASC = RUTHROUGHPUT_ASC;
        function RUTHROUGHPUT_DESC(snapshot) {
            return RUTHROUGHPUT(snapshot, true);
        }
        FBTableSortFunctions.RUTHROUGHPUT_DESC = RUTHROUGHPUT_DESC;
        function RUSIZE(snapshot, descending) {
            var daq = snapshot.getDAQ();
            var fedBuilders = daq.fedBuilders;
            // sort the FEDBuilders based on their RU size
            fedBuilders.sort(function (firstFedBuilder, secondFedBuilder) {
                if (firstFedBuilder.ru.isEVM) {
                    return -1;
                }
                else if (secondFedBuilder.ru.isEVM) {
                    return 1;
                }
                var firstFedBuilderRUSize = firstFedBuilder.ru.superFragmentSizeMean;
                var secondFedBuilderRUSize = secondFedBuilder.ru.superFragmentSizeMean;
                if (firstFedBuilderRUSize > secondFedBuilderRUSize) {
                    return (descending ? -1 : 1);
                }
                else if (firstFedBuilderRUSize < secondFedBuilderRUSize) {
                    return (descending ? 1 : -1);
                }
                else {
                    return 0;
                }
            });
            return snapshot;
        }
        function RUSIZE_ASC(snapshot) {
            return RUSIZE(snapshot, false);
        }
        FBTableSortFunctions.RUSIZE_ASC = RUSIZE_ASC;
        function RUSIZE_DESC(snapshot) {
            return RUSIZE(snapshot, true);
        }
        FBTableSortFunctions.RUSIZE_DESC = RUSIZE_DESC;
        function RUNUMFRAG(snapshot, descending) {
            var daq = snapshot.getDAQ();
            var fedBuilders = daq.fedBuilders;
            // sort the FEDBuilders based on their RU number of fragments in RU
            fedBuilders.sort(function (firstFedBuilder, secondFedBuilder) {
                if (firstFedBuilder.ru.isEVM) {
                    return -1;
                }
                else if (secondFedBuilder.ru.isEVM) {
                    return 1;
                }
                var firstFedBuilderRUNumfrag = firstFedBuilder.ru.fragmentsInRU;
                var secondFedBuilderRUNumfrag = secondFedBuilder.ru.fragmentsInRU;
                if (firstFedBuilderRUNumfrag > secondFedBuilderRUNumfrag) {
                    return (descending ? -1 : 1);
                }
                else if (firstFedBuilderRUNumfrag < secondFedBuilderRUNumfrag) {
                    return (descending ? 1 : -1);
                }
                else {
                    return 0;
                }
            });
            return snapshot;
        }
        function RUNUMFRAG_ASC(snapshot) {
            return RUNUMFRAG(snapshot, false);
        }
        FBTableSortFunctions.RUNUMFRAG_ASC = RUNUMFRAG_ASC;
        function RUNUMFRAG_DESC(snapshot) {
            return RUNUMFRAG(snapshot, true);
        }
        FBTableSortFunctions.RUNUMFRAG_DESC = RUNUMFRAG_DESC;
        function RUNUMEVTSINRU(snapshot, descending) {
            var daq = snapshot.getDAQ();
            var fedBuilders = daq.fedBuilders;
            // sort the FEDBuilders based on their RU number of events in RU
            fedBuilders.sort(function (firstFedBuilder, secondFedBuilder) {
                if (firstFedBuilder.ru.isEVM) {
                    return -1;
                }
                else if (secondFedBuilder.ru.isEVM) {
                    return 1;
                }
                var firstFedBuilderRUNumevts = firstFedBuilder.ru.eventsInRU;
                var secondFedBuilderRUNumevts = secondFedBuilder.ru.eventsInRU;
                if (firstFedBuilderRUNumevts > secondFedBuilderRUNumevts) {
                    return (descending ? -1 : 1);
                }
                else if (firstFedBuilderRUNumevts < secondFedBuilderRUNumevts) {
                    return (descending ? 1 : -1);
                }
                else {
                    return 0;
                }
            });
            return snapshot;
        }
        function RUNUMEVTSINRU_ASC(snapshot) {
            return RUNUMEVTSINRU(snapshot, false);
        }
        FBTableSortFunctions.RUNUMEVTSINRU_ASC = RUNUMEVTSINRU_ASC;
        function RUNUMEVTSINRU_DESC(snapshot) {
            return RUNUMEVTSINRU(snapshot, true);
        }
        FBTableSortFunctions.RUNUMEVTSINRU_DESC = RUNUMEVTSINRU_DESC;
        function RUNUMEVTS(snapshot, descending) {
            var daq = snapshot.getDAQ();
            var fedBuilders = daq.fedBuilders;
            // sort the FEDBuilders based on their RU number of events in RU
            fedBuilders.sort(function (firstFedBuilder, secondFedBuilder) {
                if (firstFedBuilder.ru.isEVM) {
                    return -1;
                }
                else if (secondFedBuilder.ru.isEVM) {
                    return 1;
                }
                var firstFedBuilderRUNumevts = firstFedBuilder.ru.eventCount;
                var secondFedBuilderRUNumevts = secondFedBuilder.ru.eventCount;
                if (firstFedBuilderRUNumevts > secondFedBuilderRUNumevts) {
                    return (descending ? -1 : 1);
                }
                else if (firstFedBuilderRUNumevts < secondFedBuilderRUNumevts) {
                    return (descending ? 1 : -1);
                }
                else {
                    return 0;
                }
            });
            return snapshot;
        }
        function RUNUMEVTS_ASC(snapshot) {
            return RUNUMEVTS(snapshot, false);
        }
        FBTableSortFunctions.RUNUMEVTS_ASC = RUNUMEVTS_ASC;
        function RUNUMEVTS_DESC(snapshot) {
            return RUNUMEVTS(snapshot, true);
        }
        FBTableSortFunctions.RUNUMEVTS_DESC = RUNUMEVTS_DESC;
        function RUREQUESTS(snapshot, descending) {
            var daq = snapshot.getDAQ();
            var fedBuilders = daq.fedBuilders;
            // sort the FEDBuilders based on their RU number of requests
            fedBuilders.sort(function (firstFedBuilder, secondFedBuilder) {
                if (firstFedBuilder.ru.isEVM) {
                    return -1;
                }
                else if (secondFedBuilder.ru.isEVM) {
                    return 1;
                }
                var firstFedBuilderRURequests = firstFedBuilder.ru.requests;
                var secondFedBuilderRURequests = secondFedBuilder.ru.requests;
                if (firstFedBuilderRURequests > secondFedBuilderRURequests) {
                    return (descending ? -1 : 1);
                }
                else if (firstFedBuilderRURequests < secondFedBuilderRURequests) {
                    return (descending ? 1 : -1);
                }
                else {
                    return 0;
                }
            });
            return snapshot;
        }
        function RUREQUESTS_ASC(snapshot) {
            return RUREQUESTS(snapshot, false);
        }
        FBTableSortFunctions.RUREQUESTS_ASC = RUREQUESTS_ASC;
        function RUREQUESTS_DESC(snapshot) {
            return RUREQUESTS(snapshot, true);
        }
        FBTableSortFunctions.RUREQUESTS_DESC = RUREQUESTS_DESC;
    })(FBTableSortFunctions = DAQView.FBTableSortFunctions || (DAQView.FBTableSortFunctions = {}));
    //assignment of sort function to the columns (where applicable)
    var FB_TABLE_BASE_HEADERS = [
        { content: 'P' },
        { content: 'A' },
        { content: 'F' },
        {
            content: '%W',
            sortFunctions: {
                Ascending: { sort: FBTableSortFunctions.PERCWARNING_ASC },
                Descending: { sort: FBTableSortFunctions.PERCWARNING_DESC }
            }
        },
        {
            content: '%B',
            sortFunctions: {
                Ascending: { sort: FBTableSortFunctions.PERCBUSY_ASC },
                Descending: { sort: FBTableSortFunctions.PERCBUSY_DESC }
            }
        },
        { content: 'frlpc' },
        { content: '' },
        { content: 'geoSlot:SrcId      /      TTSOnlyFEDSrcId' },
        { content: 'min Trg' },
        { content: 'max Trg' },
        {
            content: 'FB Name',
            sortFunctions: {
                Ascending: { sort: FBTableSortFunctions.FB_ASC },
                Descending: { sort: FBTableSortFunctions.FB_DESC }
            }
        },
        {
            content: 'RU',
            sortFunctions: {
                Ascending: { sort: FBTableSortFunctions.RU_HOSTNAME_ASC },
                Descending: { sort: FBTableSortFunctions.RU_HOSTNAME_DESC }
            }
        },
        { content: '         ' },
        { content: 'warn' },
        {
            content: 'rate (kHz)',
            sortFunctions: {
                Ascending: { sort: FBTableSortFunctions.RURATE_ASC },
                Descending: { sort: FBTableSortFunctions.RURATE_DESC }
            }
        },
        {
            content: 'thru (MB/s)',
            sortFunctions: {
                Ascending: { sort: FBTableSortFunctions.RUTHROUGHPUT_ASC },
                Descending: { sort: FBTableSortFunctions.RUTHROUGHPUT_DESC }
            }
        },
        {
            content: 'size (kB)',
            sortFunctions: {
                Ascending: { sort: FBTableSortFunctions.RUSIZE_ASC },
                Descending: { sort: FBTableSortFunctions.RUSIZE_DESC }
            }
        },
        {
            content: '#events',
            sortFunctions: {
                Ascending: { sort: FBTableSortFunctions.RUNUMEVTS_ASC },
                Descending: { sort: FBTableSortFunctions.RUNUMEVTS_DESC }
            }
        },
        {
            content: '#frags in RU',
            sortFunctions: {
                Ascending: { sort: FBTableSortFunctions.RUNUMFRAG_ASC },
                Descending: { sort: FBTableSortFunctions.RUNUMFRAG_DESC }
            }
        },
        {
            content: '#evts in RU',
            sortFunctions: {
                Ascending: { sort: FBTableSortFunctions.RUNUMEVTSINRU_ASC },
                Descending: { sort: FBTableSortFunctions.RUNUMEVTSINRU_DESC }
            }
        },
        {
            content: '#requests',
            sortFunctions: {
                Ascending: { sort: FBTableSortFunctions.RUREQUESTS_ASC },
                Descending: { sort: FBTableSortFunctions.RUREQUESTS_DESC }
            }
        }
    ];
    var FB_TABLE_TOP_HEADERS = FB_TABLE_BASE_HEADERS.slice();
    FB_TABLE_TOP_HEADERS.unshift({
        content: 'TTCP',
        sortFunctions: {
            Ascending: { presort: FBTableSortFunctions.NONE, sort: FBTableSortFunctions.TTCP_ASC },
            Descending: { presort: FBTableSortFunctions.NONE, sort: FBTableSortFunctions.TTCP_DESC }
        }
    });
    var FB_TABLE_SUMMARY_HEADERS = FB_TABLE_BASE_HEADERS.slice();
    FB_TABLE_SUMMARY_HEADERS.unshift({ content: 'Summary' });
    var FEDBuilderTableElement = (function (_super) {
        __extends(FEDBuilderTableElement, _super);
        function FEDBuilderTableElement() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        FEDBuilderTableElement.prototype.render = function () {
            var fedBuilders = this.props.fedBuilders;
            var drawPausedComponents = this.props.drawPausedComponent;
            var drawZeroDataFlowComponents = this.props.drawZeroDataFlowComponent;
            var drawStaleSnapshot = this.props.drawStaleSnapshot;
            var tcdsControllerUrl = this.props.tcdsControllerUrl;
            var tcdsControllerServiceName = this.props.tcdsControllerServiceName;
            var evmMaxTrg = null;
            //can similarly invent and pass down the evm minTrg here, for comparison at innermost levels
            fedBuilders.forEach(function (fedBuilder) {
                if (fedBuilder.ru != null && fedBuilder.ru.isEVM) {
                    if (fedBuilder.subFedbuilders != null && fedBuilder.subFedbuilders.length > 0) {
                        evmMaxTrg = fedBuilder.subFedbuilders[0].maxTrig;
                    }
                }
            });
            var fedBuilderRows = [];
            fedBuilders.forEach(function (fedBuilder) {
                var index = fedBuilderRows.length;
                var oddRow = (index % 2 == 1) ? true : false;
                fedBuilderRows.push(React.createElement(FEDBuilderRow, { key: fedBuilder['@id'], fedBuilder: fedBuilder, evmMaxTrg: evmMaxTrg, drawPausedComponent: drawPausedComponents, drawZeroDataFlowComponent: drawZeroDataFlowComponents, tcdsControllerUrl: tcdsControllerUrl, tcdsControllerServiceName: tcdsControllerServiceName, oddRow: oddRow, drawStaleSnapshot: drawStaleSnapshot }));
            });
            var fedBuilderSummary = this.props.fedBuilderSummary;
            var numRus = fedBuilders.length;
            var numUsedRus = numRus - fedBuilderSummary.rusMasked;
            var tableObject = this.props.tableObject;
            return (React.createElement("table", { className: "fb-table" },
                React.createElement("colgroup", { className: "fb-table-colgroup-fedbuilder", span: 12 }),
                React.createElement("colgroup", { className: "fb-table-colgroup-evb", span: 10 }),
                React.createElement("thead", { className: "fb-table-head" },
                    React.createElement(FEDBuilderTableTopHeaderRow, { key: "fb-top-header-row", drawPausedComponent: drawPausedComponents }),
                    React.createElement(FEDBuilderTableSecondaryHeaderRow, { key: "fb-secondary-header-row", drawPausedComponent: drawPausedComponents }),
                    React.createElement(FEDBuilderTableHeaderRow, { key: "fb-header-row", tableObject: tableObject, headers: FB_TABLE_TOP_HEADERS, drawPausedComponent: drawPausedComponents })),
                fedBuilderRows,
                React.createElement("tfoot", { className: "fb-table-foot" },
                    React.createElement(FEDBuilderTableHeaderRow, { key: "fb-summary-header-row", tableObject: tableObject, headers: FB_TABLE_SUMMARY_HEADERS, drawPausedComponent: drawPausedComponents }),
                    React.createElement(FEDBuilderTableSummaryRow, { key: "fb-summary-row", fedBuilderSummary: fedBuilderSummary, numRus: numRus, numUsedRus: numUsedRus, drawPausedComponent: drawPausedComponents, drawZeroDataFlowComponent: drawZeroDataFlowComponents, drawStaleSnapshot: drawStaleSnapshot }))));
        };
        return FEDBuilderTableElement;
    }(React.Component));
    var RUWarningData = (function (_super) {
        __extends(RUWarningData, _super);
        function RUWarningData() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        RUWarningData.prototype.render = function () {
            var warnMsg = '';
            var ruWarningData = [];
            var ru = this.props.ru;
            if (ru.stateName != 'Halted' && ru.stateName != 'Ready' && ru.stateName != 'Enabled') {
                warnMsg += ru.stateName + ' ';
            }
            var fedsWithErrors = ru.fedsWithErrors;
            var addTtcpPrefix = (ru.fedBuilder.subFedbuilders.length > 1);
            var fedWithErrors;
            //without fragments
            for (var idx = 0; idx < fedsWithErrors.length; idx++) {
                fedWithErrors = fedsWithErrors[idx];
                if (fedWithErrors.ruFedWithoutFragments && ru.rate == 0 && ru.incompleteSuperFragmentCount > 0) {
                    ruWarningData.push(React.createElement("span", { className: "fb-table-ru-warn-message" },
                        " ",
                        (addTtcpPrefix ? fedWithErrors.ttcp.name + ':' : '') + fedWithErrors.srcIdExpected + ' ',
                        " "));
                }
            }
            //error counters
            for (var idx = 0; idx < fedsWithErrors.length; idx++) {
                fedWithErrors = fedsWithErrors[idx];
                var errorString = '';
                if (fedWithErrors.ruFedDataCorruption > 0) {
                    errorString += '#bad=' + fedWithErrors.ruFedDataCorruption + ',';
                }
                if (fedWithErrors.ruFedOutOfSync > 0) {
                    errorString += '#OOS=' + fedWithErrors.ruFedOutOfSync + ',';
                }
                if (fedWithErrors.ruFedBXError > 0) {
                    errorString += '#BX=' + fedWithErrors.ruFedBXError + ',';
                }
                if (fedWithErrors.ruFedCRCError > 0) {
                    errorString += '#CRC=' + fedWithErrors.ruFedCRCError + ',';
                }
                if (errorString != '') {
                    ruWarningData.push(React.createElement("span", { className: "fb-table-ru-warn-message" },
                        " ",
                        (addTtcpPrefix ? fedWithErrors.ttcp.name + ':' : '') + fedWithErrors.srcIdExpected + ':' + errorString,
                        " "));
                }
            }
            return (React.createElement("td", null, ruWarningData));
        };
        return RUWarningData;
    }(React.Component));
    var FEDBuilderRow = (function (_super) {
        __extends(FEDBuilderRow, _super);
        function FEDBuilderRow() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        FEDBuilderRow.prototype.render = function () {
            var _this = this;
            var drawPausedComponent = this.props.drawPausedComponent;
            var drawZeroDataFlowComponent = this.props.drawZeroDataFlowComponent;
            var drawStaleSnapshot = this.props.drawStaleSnapshot;
            var oddRow = this.props.oddRow;
            var fedBuilder = this.props.fedBuilder;
            var subFedBuilders = fedBuilder.subFedbuilders;
            var numSubFedBuilders = subFedBuilders.length;
            var ru = fedBuilder.ru;
            var ruMasked = ru.masked;
            var ruHostname = ru.hostname;
            var ruPort = ru.port;
            var ruName = ruHostname.split(".")[0];
            ruName = ruName.indexOf('ru') == 0 ? ruName.substring(3) : ruName;
            var ruUrl = 'http://' + ruHostname + ':' + ruPort + '/urn:xdaq-application:service=' + (ru.isEVM ? 'evm' : 'ru');
            var ruUrlDisplay = ruName;
            var ruUrlDisplayClass = "fb-table-stale-member-wrapbox"; //assume stale and overwrite if not
            var ruDebug = ru.isEVM ? "Check problems with EVM flashlist!" : "Check problems with RU flashlist!";
            if (ruPort > 0) {
                ruUrlDisplay = React.createElement("a", { href: ruUrl, target: "_blank" }, ruName);
                ruUrlDisplayClass = "";
                ruDebug = "";
            }
            var ruState = '';
            var ruStateClass = 'fb-table-ru-state-normal';
            if (ru.stateName) {
                ruState = ru.stateName;
                if (ruState === 'Halted' || ruState === 'Ready' || ruState === 'Enabled' || ruState === 'unknown' || ruState === '') {
                    ruState = '';
                }
                else {
                    ruStateClass = 'fb-table-ru-state-warn';
                }
                if (ruState === 'Failed' || ruState === 'Error') {
                    ruStateClass = 'fb-table-ru-state-error';
                }
            }
            var ruJobCrashStateDisplay = "";
            var ruJobCrashStateDisplayClass = "";
            if (ru.crashed) {
                ruJobCrashStateDisplay = "JobCrash";
                ruJobCrashStateDisplayClass = "fb-table-jobcrash";
            }
            var fbRowZeroEvmRateClass = "";
            if (drawZeroDataFlowComponent && fedBuilder.ru.isEVM) {
                fbRowZeroEvmRateClass = "fb-table-fb-evm-row-ratezero";
            }
            var fbRowRateClass = classNames(fbRowZeroEvmRateClass, FormatUtility.getClassNameForNumber(ru.rate, FBTableNumberFormats.RATE));
            var fedBuilderData = [];
            fedBuilderData.push(React.createElement("td", { rowSpan: numSubFedBuilders }, fedBuilder.name));
            fedBuilderData.push(React.createElement("td", { rowSpan: numSubFedBuilders },
                React.createElement("div", { title: ruDebug, className: ruUrlDisplayClass }, ruUrlDisplay)));
            fedBuilderData.push(React.createElement("td", { rowSpan: numSubFedBuilders },
                React.createElement("div", { className: ruStateClass }, ruState),
                React.createElement("div", { className: ruJobCrashStateDisplayClass }, ruJobCrashStateDisplay)));
            fedBuilderData.push(React.createElement("td", { rowSpan: numSubFedBuilders },
                React.createElement(RUWarningData, { key: ru['@id'], ru: ru })));
            fedBuilderData.push(React.createElement("td", { rowSpan: numSubFedBuilders, className: fbRowRateClass }, (ru.rate / 1000).toFixed(3)));
            fedBuilderData.push(React.createElement("td", { rowSpan: numSubFedBuilders, className: FormatUtility.getClassNameForNumber(ru.throughput, FBTableNumberFormats.THROUGHPUT) }, (ru.throughput / 1000 / 1000).toFixed(1)));
            var sizeClass;
            var eventCountClass;
            var fragmentInRuClass;
            var eventsInRuClass;
            var requestsClass;
            if (ruMasked && ru.eventCount == 0) {
                sizeClass = eventCountClass = fragmentInRuClass = eventsInRuClass = requestsClass = 'fb-table-ru-masked';
            }
            else {
                sizeClass = FormatUtility.getClassNameForNumber(ru.superFragmentSizeMean, FBTableNumberFormats.SIZE);
                eventCountClass = FormatUtility.getClassNameForNumber(ru.eventCount, FBTableNumberFormats.EVENTS);
                fragmentInRuClass = FormatUtility.getClassNameForNumber(ru.fragmentsInRU, FBTableNumberFormats.FRAGMENTS_IN_RU);
                eventsInRuClass = FormatUtility.getClassNameForNumber(ru.eventsInRU, FBTableNumberFormats.EVENTS_IN_RU);
                requestsClass = FormatUtility.getClassNameForNumber(ru.requests, FBTableNumberFormats.REQUESTS);
            }
            //invert color when DAQ is stuck, because red colors are missed
            if (drawZeroDataFlowComponent && oddRow) {
                var escapeRedField = 'fb-table-ru-red-column-escape';
                if (fragmentInRuClass === 'fb-table-ru-fragments-in-ru') {
                    fragmentInRuClass = escapeRedField;
                }
                if (eventsInRuClass === 'fb-table-ru-events-in-ru') {
                    eventsInRuClass = escapeRedField;
                }
                if (requestsClass === 'fb-table-ru-requests') {
                    requestsClass = escapeRedField;
                }
            }
            var superFragmentSizePrecision = (ru.superFragmentSizeMean > 1000) ? 1 : 3;
            fedBuilderData.push(React.createElement("td", { rowSpan: numSubFedBuilders, className: sizeClass },
                (ru.superFragmentSizeMean / 1000).toFixed(superFragmentSizePrecision),
                "\u00B1",
                (ru.superFragmentSizeStddev / 1000).toFixed(superFragmentSizePrecision)));
            fedBuilderData.push(React.createElement("td", { rowSpan: numSubFedBuilders, className: eventCountClass }, ru.eventCount));
            fedBuilderData.push(React.createElement("td", { rowSpan: numSubFedBuilders, className: fragmentInRuClass }, ru.fragmentsInRU));
            fedBuilderData.push(React.createElement("td", { rowSpan: numSubFedBuilders, className: eventsInRuClass }, ru.eventsInRU));
            fedBuilderData.push(React.createElement("td", { rowSpan: numSubFedBuilders, className: requestsClass }, ru.requests));
            var fbRowClass = drawPausedComponent ? "fb-table-fb-row-paused" : "fb-table-fb-row-running";
            if (drawZeroDataFlowComponent) {
                fbRowClass = "fb-table-fb-row-ratezero";
            }
            if (drawStaleSnapshot && (!drawPausedComponent)) {
                fbRowClass = 'fb-table-fb-row-stale-page-row';
            }
            var fbRowClassName = classNames(fbRowClass, this.props.additionalClasses);
            var children = [];
            var count = 0;
            subFedBuilders.forEach(function (subFedBuilder) { return children.push(React.createElement(SubFEDBuilderRow, { evmMaxTrg: _this.props.evmMaxTrg, subFedBuilder: subFedBuilder, additionalContent: ++count == 1 ? fedBuilderData : null, tcdsControllerUrl: _this.props.tcdsControllerUrl, tcdsControllerServiceName: _this.props.tcdsControllerServiceName, drawZeroDataFlowComponent: drawZeroDataFlowComponent })); });
            return (React.createElement("tbody", { className: fbRowClassName }, children));
        };
        return FEDBuilderRow;
    }(React.Component));
    var FEDBuilderTableTopHeaderRow = (function (_super) {
        __extends(FEDBuilderTableTopHeaderRow, _super);
        function FEDBuilderTableTopHeaderRow() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        FEDBuilderTableTopHeaderRow.prototype.shouldComponentUpdate = function () {
            return false;
        };
        FEDBuilderTableTopHeaderRow.prototype.render = function () {
            var drawPausedComponent = this.props.drawPausedComponent;
            return (React.createElement("tr", { className: "fb-table-top-header-row" },
                React.createElement(FEDBuilderTableHeader, { additionalClasses: "fb-table-help", content: React.createElement("a", { href: "fbtablehelp.html", target: "_blank" }, "Table Help"), colSpan: 1, drawPausedComponent: drawPausedComponent }),
                React.createElement(FEDBuilderTableHeader, { content: "F  E  D  B  U  I  L  D  E  R", colSpan: 11, drawPausedComponent: drawPausedComponent }),
                React.createElement(FEDBuilderTableHeader, { content: "E  V  B", colSpan: 10, drawPausedComponent: drawPausedComponent })));
        };
        return FEDBuilderTableTopHeaderRow;
    }(React.Component));
    var FEDBuilderTableSecondaryHeaderRow = (function (_super) {
        __extends(FEDBuilderTableSecondaryHeaderRow, _super);
        function FEDBuilderTableSecondaryHeaderRow() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        FEDBuilderTableSecondaryHeaderRow.prototype.shouldComponentUpdate = function () {
            return false;
        };
        FEDBuilderTableSecondaryHeaderRow.prototype.render = function () {
            var drawPausedComponent = this.props.drawPausedComponent;
            return (React.createElement("tr", { className: "fb-table-secondary-header-row" },
                React.createElement(FEDBuilderTableHeader, { content: "", colSpan: 1, drawPausedComponent: drawPausedComponent }),
                React.createElement(FEDBuilderTableHeader, { content: "T T S", colSpan: 3, drawPausedComponent: drawPausedComponent }),
                React.createElement(FEDBuilderTableHeader, { content: "", colSpan: 18, drawPausedComponent: drawPausedComponent })));
        };
        return FEDBuilderTableSecondaryHeaderRow;
    }(React.Component));
    var FEDBuilderTableHeaderRow = (function (_super) {
        __extends(FEDBuilderTableHeaderRow, _super);
        function FEDBuilderTableHeaderRow() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        FEDBuilderTableHeaderRow.prototype.render = function () {
            var drawPausedComponent = this.props.drawPausedComponent;
            var tableObject = this.props.tableObject;
            var children = [];
            this.props.headers.forEach(function (header) { return children.push(React.createElement(FEDBuilderTableHeader, { key: header.content, content: header.content, colSpan: header.colSpan, additionalClasses: header.additionalClasses, tableObject: tableObject, sorting: tableObject.getCurrentSorting(header.content), sortFunctions: header.sortFunctions, drawPausedComponent: drawPausedComponent })); });
            return (React.createElement("tr", { className: "fb-table-header-row" }, children));
        };
        return FEDBuilderTableHeaderRow;
    }(React.Component));
    var FEDBuilderTableHeader = (function (_super) {
        __extends(FEDBuilderTableHeader, _super);
        function FEDBuilderTableHeader() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        FEDBuilderTableHeader.prototype.shouldComponentUpdate = function (nextProps) {
            return this.props.sorting !== nextProps.sorting;
        };
        FEDBuilderTableHeader.prototype.render = function () {
            var drawPausedComponent = this.props.drawPausedComponent;
            var content = this.props.content;
            var colSpan = this.props.colSpan;
            var additionalClasses = this.props.additionalClasses;
            var fbHeaderClass = "fb-table-header";
            var className = classNames(fbHeaderClass, additionalClasses);
            var tableObject = this.props.tableObject;
            var currentSorting = this.props.sorting ? this.props.sorting : null;
            var sortFunctions = this.props.sortFunctions;
            var isSortable = (tableObject != null && sortFunctions != null);
            var clickFunction = null;
            if (isSortable) {
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
            if (currentSorting != null) {
                sortingImage = React.createElement("input", { type: "image", className: "fb-table-sort-image", src: 'dist/img/' + currentSorting.getImagePath(), alt: currentSorting.toString(), title: "Sort", onClick: clickFunction });
            }
            return (React.createElement("th", { className: className, colSpan: colSpan ? colSpan : 1 },
                content,
                sortingImage));
        };
        return FEDBuilderTableHeader;
    }(React.Component));
    var SubFEDBuilderRow = (function (_super) {
        __extends(SubFEDBuilderRow, _super);
        function SubFEDBuilderRow() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        SubFEDBuilderRow.prototype.render = function () {
            var drawZeroDataFlowComponent = this.props.drawZeroDataFlowComponent;
            var subFedBuilder = this.props.subFedBuilder;
            var frlPc = subFedBuilder.frlPc;
            var frlPcHostname = frlPc.hostname;
            var frlPcPort = frlPc.port;
            var frlPcName = frlPcHostname.split(".")[0];
            frlPcName = frlPcName.indexOf('frlpc') == 0 && frlPcName.indexOf('frlpc40') == -1 ? frlPcName.substring(6) : frlPcName;
            frlPcName = frlPcName.indexOf('frlpc40') == 0 ? frlPcName.substring(8) : frlPcName;
            var frlPcUrl = 'http://' + frlPcHostname + ':' + frlPcPort;
            var frls = subFedBuilder.frls;
            var pseudoFeds = subFedBuilder.feds;
            var frlPcUrlDisplay = frlPcName;
            var frlPcUrlDisplayClass = "fb-table-stale-member-wrapbox"; //assume stale and overwrite if not
            var frlPcDebug = "Check problems with FEROL_CONFIGURATION flashlist!";
            if (frlPcPort > 0) {
                frlPcUrlDisplay = React.createElement("a", { href: frlPcUrl, target: "_blank" }, frlPcName);
                frlPcUrlDisplayClass = "";
                frlPcDebug = "";
            }
            var additionalClasses = this.props.additionalClasses;
            var className = classNames("fb-table-subfb-row", additionalClasses);
            var ttcPartition = subFedBuilder.ttcPartition;
            var ttsState = '';
            var ttsStateTcdsPm = ttcPartition.tcds_pm_ttsState ? ttcPartition.tcds_pm_ttsState.substring(0, 1) : 'x';
            var ttsStateTcdsApvPm = ttcPartition.tcds_apv_pm_ttsState ? ttcPartition.tcds_apv_pm_ttsState.substring(0, 1) : 'x';
            if (ttcPartition.tcdsPartitionInfo && ttcPartition.tcdsPartitionInfo.nullCause) {
                ttsStateTcdsPm = ttcPartition.tcdsPartitionInfo.nullCause;
                ttsStateTcdsApvPm = ttcPartition.tcdsPartitionInfo.nullCause;
            }
            if (ttcPartition.topFMMInfo && ttcPartition.topFMMInfo.nullCause) {
                ttsState = ttcPartition.topFMMInfo.nullCause;
            }
            else {
                if (ttcPartition.masked) {
                    ttsState = '-';
                    ttsStateTcdsPm = '-';
                    ttsStateTcdsApvPm = '-';
                }
                else {
                    if (ttcPartition.fmm) {
                        if (ttcPartition.fmm.stateName && ttcPartition.fmm.stateName === 'Ready' || ttcPartition.fmm.stateName && ttcPartition.fmm.stateName === 'Enabled') {
                            ttsState = ttcPartition.ttsState ? ttcPartition.ttsState.substring(0, 1) : '?';
                        }
                        else {
                            ttsState = '-';
                        }
                    }
                    else {
                        ttsState = 'x';
                    }
                }
            }
            var ttsStateClasses = ttcPartition.ttsState ? 'fb-table-subfb-tts-state-' + ttsState : 'fb-table-subfb-tts-state-none';
            ttsStateClasses = classNames(ttsStateClasses, 'fb-table-subfb-tts-state');
            var ttsStateTcdsPmClasses = ttcPartition.tcds_pm_ttsState || ttcPartition.tcds_pm_ttsState != '-' ? 'fb-table-subfb-tts-state-' + ttsStateTcdsPm : 'fb-table-subfb-tts-state-none';
            ttsStateTcdsPmClasses = classNames(ttsStateTcdsPmClasses, 'fb-table-subfb-tts-state');
            var ttsStateTcdsApvClasses = ttcPartition.tcds_apv_pm_ttsState || ttcPartition.tcds_apv_pm_ttsState != '-' ? 'fb-table-subfb-tts-state-' + ttsStateTcdsApvPm : 'fb-table-subfb-tts-state-none';
            ttsStateTcdsApvClasses = classNames(ttsStateTcdsApvClasses, 'fb-table-subfb-tts-state');
            var minTrig = subFedBuilder.minTrig;
            var maxTrig = subFedBuilder.maxTrig;
            var minTrigUnequalMaxTrig = minTrig != maxTrig;
            var maxTrigSet = maxTrig >= 0;
            var ttcPartitionTTSStateLink = ttsState;
            if (ttcPartition.fmm != null && ttcPartition.fmm.url != null && ttsState != '-' && ttsState != 'x' && ttsState.substring(0, 2) != 'no' && ttsState != '?') {
                ttcPartitionTTSStateLink =
                    React.createElement("a", { href: ttcPartition.fmm.url + '/urn:xdaq-application:service=fmmcontroller', target: "_blank", title: ttcPartition.ttsState }, ttsState);
            }
            var tcdsControllerUrl = this.props.tcdsControllerUrl;
            var tcdsControllerServiceName = this.props.tcdsControllerServiceName;
            var ttcPartitionTTSStateTcdsPmLink = ttsStateTcdsPm;
            if (ttcPartition.tcds_pm_ttsState != null && ttcPartition.tcds_pm_ttsState != '-' && ttsStateTcdsPm != '-' && ttcPartition.tcds_pm_ttsState != 'x' && ttcPartition.tcds_pm_ttsState.substring(0, 2) != 'no') {
                ttcPartitionTTSStateTcdsPmLink =
                    React.createElement("a", { href: tcdsControllerUrl + '/urn:xdaq-application:service=' + tcdsControllerServiceName, target: "_blank", title: ttcPartition.tcds_pm_ttsState }, ttsStateTcdsPm);
            }
            var ttcPartitionTTSStateTcdsApvPmLink = ttsStateTcdsApvPm;
            if (ttcPartition.tcds_apv_pm_ttsState != null && ttcPartition.tcds_apv_pm_ttsState != '-' && ttsStateTcdsApvPm != '-' && ttcPartition.tcds_apv_pm_ttsState != 'x' && ttcPartition.tcds_pm_ttsState.substring(0, 2) != 'no') {
                ttcPartitionTTSStateTcdsApvPmLink =
                    React.createElement("a", { href: tcdsControllerUrl + '/urn:xdaq-application:service=' + tcdsControllerServiceName, target: "_blank", title: ttcPartition.tcds_apv_pm_ttsState }, ttsStateTcdsApvPm);
            }
            var ttcPartitionTTSStateDisplay_F = React.createElement("span", { className: ttsStateClasses }, ttcPartitionTTSStateLink);
            var ttcPartitionTTSStateDisplay_P = React.createElement("span", { className: ttsStateTcdsPmClasses }, ttcPartitionTTSStateTcdsPmLink);
            var ttcPartitionTTSStateDisplay_A = React.createElement("span", { className: ttsStateTcdsApvClasses }, ttcPartitionTTSStateTcdsApvPmLink);
            var ttcpPercWarn = ttcPartition.percentWarning != null ? ttcPartition.percentWarning.toFixed(1) : '-';
            var ttcpPercBusy = ttcPartition.percentWarning != null ? ttcPartition.percentBusy.toFixed(1) : '-';
            //on special cases of ttsState, percentages cannot be retrieved, therefore assign them the special state
            if (ttsState === '-' || ttsState === 'x' || ttsState === '?') {
                ttcpPercWarn = ttsState;
                ttcpPercBusy = ttsState;
            }
            if (ttcPartition.topFMMInfo.nullCause) {
                ttcpPercWarn = ttcPartition.topFMMInfo.nullCause;
                ttcpPercBusy = ttcPartition.topFMMInfo.nullCause;
            }
            var evmMaxTrg = this.props.evmMaxTrg;
            var minTrigDisplayContent = '';
            var maxTrigDisplayContent = maxTrigSet ? maxTrig : '';
            if (minTrigUnequalMaxTrig) {
                minTrigDisplayContent = minTrig;
            }
            var minTrigClassNames = 'fb-table-subfb-min-trig';
            var maxTrigClassNames = 'fb-table-subfb-max-trig';
            if (evmMaxTrg != null) {
                if (minTrig != evmMaxTrg && minTrigUnequalMaxTrig) {
                    minTrigClassNames = classNames(minTrigClassNames, minTrigClassNames + '-unequal');
                }
                else {
                    minTrigClassNames = classNames(minTrigClassNames, minTrigClassNames + '-equal');
                }
                if (maxTrig != evmMaxTrg && maxTrigSet) {
                    maxTrigClassNames = classNames(maxTrigClassNames, maxTrigClassNames + '-unequal');
                }
                else {
                    maxTrigClassNames = classNames(maxTrigClassNames, maxTrigClassNames + '-equal');
                }
            }
            var frlpcStateDisplay = "";
            var frlpcStateDisplayClass = "";
            if (frlPc.crashed) {
                frlpcStateDisplay = "JobCrash";
                frlpcStateDisplayClass = "fb-table-jobcrash";
            }
            var fmmAppStateDisplay = "";
            var fmmAppStateDisplayClass = "";
            if (ttcPartition.fmm && ttcPartition.fmm.fmmApplication && ttcPartition.fmm.fmmApplication.crashed) {
                fmmAppStateDisplay = "JobCrash";
                fmmAppStateDisplayClass = "fb-table-jobcrash";
            }
            return (React.createElement("tr", { className: className },
                React.createElement("td", null,
                    ttcPartition.name,
                    ":",
                    ttcPartition.ttcpNr),
                React.createElement("td", { className: "fb-table-subfb-tts-perc" }, ttcPartitionTTSStateDisplay_P),
                React.createElement("td", { className: "fb-table-subfb-tts-perc" }, ttcPartitionTTSStateDisplay_A),
                React.createElement("td", null,
                    React.createElement("div", { className: "fb-table-subfb-tts-perc" }, ttcPartitionTTSStateDisplay_F),
                    React.createElement("div", { className: fmmAppStateDisplayClass }, fmmAppStateDisplay)),
                React.createElement("td", { className: "fb-table-subfb-tts-perc" }, ttcpPercWarn),
                React.createElement("td", { className: "fb-table-subfb-tts-perc" }, ttcpPercBusy),
                React.createElement("td", null,
                    React.createElement("div", { title: frlPcDebug, className: frlPcUrlDisplayClass }, frlPcUrlDisplay)),
                React.createElement("td", { className: frlpcStateDisplayClass }, frlpcStateDisplay),
                React.createElement(FRLs, { frls: frls, maxTrig: maxTrig, pseudoFeds: pseudoFeds, drawZeroDataFlowComponent: drawZeroDataFlowComponent, ttcPartition: ttcPartition }),
                React.createElement("td", null,
                    React.createElement("div", { className: minTrigClassNames }, minTrigDisplayContent)),
                React.createElement("td", null,
                    React.createElement("div", { className: maxTrigClassNames }, maxTrigDisplayContent)),
                this.props.additionalContent ? this.props.additionalContent : null));
        };
        return SubFEDBuilderRow;
    }(React.Component));
    var FRLs = (function (_super) {
        __extends(FRLs, _super);
        function FRLs() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        FRLs.prototype.render = function () {
            var frls = this.props.frls;
            var ttcPartition = this.props.ttcPartition;
            var maxTrig = this.props.maxTrig;
            var drawZeroDataFlowComponent = this.props.drawZeroDataFlowComponent;
            var pseudoFEDs = this.props.pseudoFeds;
            var fedData = [];
            var firstFrl = true;
            frls.forEach(function (frl) {
                fedData.push(React.createElement(FRL, { key: frl['@id'], frl: frl, firstFrl: firstFrl, maxTrig: maxTrig, drawZeroDataFlowComponent: drawZeroDataFlowComponent, ttcPartition: ttcPartition }));
                firstFrl = false;
            });
            pseudoFEDs.forEach(function (fed) {
                fedData.push(' ');
                fed.isPseudoFed = true; //this can be used for pseudofed-specific rendering at FEDData level
                fedData.push(React.createElement(FEDData, { key: fed['@id'], fed: fed, maxTrig: maxTrig, drawZeroDataFlowComponent: drawZeroDataFlowComponent }));
            });
            return (React.createElement("td", null, fedData));
        };
        return FRLs;
    }(React.Component));
    var FRL = (function (_super) {
        __extends(FRL, _super);
        function FRL() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        FRL.prototype.render = function () {
            var frl = this.props.frl;
            var drawZeroDataFlowComponent = this.props.drawZeroDataFlowComponent;
            var maxTrig = this.props.maxTrig;
            var ttcPartition = this.props.ttcPartition;
            var feds = frl.feds;
            var firstFed = feds && feds.hasOwnProperty("0") ? feds["0"] : null;
            var firstFedDisplay = firstFed && firstFed.ttcp.name === ttcPartition.name ? React.createElement(FEDData, { key: firstFed['@id'], fed: firstFed, maxTrig: maxTrig, drawZeroDataFlowComponent: drawZeroDataFlowComponent }) : '-';
            var secondFed = feds && feds.hasOwnProperty("1") ? feds["1"] : null;
            var secondFedDisplay = secondFed && secondFed.ttcp.name === ttcPartition.name ? React.createElement(FEDData, { key: secondFed['@id'], fed: secondFed, maxTrig: maxTrig, drawZeroDataFlowComponent: drawZeroDataFlowComponent }) : '';
            var thirdFed = feds && feds.hasOwnProperty("2") ? feds["2"] : null;
            var thirdFedDisplay = thirdFed && thirdFed.ttcp.name === ttcPartition.name ? React.createElement(FEDData, { key: thirdFed['@id'], fed: thirdFed, maxTrig: maxTrig, drawZeroDataFlowComponent: drawZeroDataFlowComponent }) : '';
            var fourthFed = feds && feds.hasOwnProperty("3") ? feds["3"] : null;
            var fourthFedDisplay = fourthFed && fourthFed.ttcp.name === ttcPartition.name ? React.createElement(FEDData, { key: fourthFed['@id'], fed: fourthFed, maxTrig: maxTrig, drawZeroDataFlowComponent: drawZeroDataFlowComponent }) : '';
            var secondFedShown = secondFed && (secondFed && secondFed.ttcp.name === ttcPartition.name);
            var thirdFedShown = thirdFed && (thirdFed && thirdFed.ttcp.name === ttcPartition.name);
            var fourthFedShown = fourthFed && (fourthFed && fourthFed.ttcp.name === ttcPartition.name);
            var firstFrl = this.props.firstFrl;
            return (React.createElement("span", null,
                firstFrl ? '' : ', ',
                frl.geoSlot,
                ":",
                firstFedDisplay,
                secondFedShown ? ',' : '',
                secondFedDisplay,
                thirdFedShown ? ',' : '',
                thirdFedDisplay,
                fourthFedShown ? ',' : '',
                fourthFedDisplay));
        };
        return FRL;
    }(React.Component));
    var FEDData = (function (_super) {
        __extends(FEDData, _super);
        function FEDData() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        FEDData.prototype.shouldComponentUpdate = function (nextProps) {
            var shouldUpdate = false;
            var currentFMMIsNull = this.props.fed.fmm == null;
            var newFmmIsNull = nextProps.fed.fmm == null;
            if (currentFMMIsNull !== newFmmIsNull) {
                shouldUpdate = true;
            }
            else if (this.props.drawZeroDataFlowComponent !== nextProps.drawZeroDataFlowComponent) {
                shouldUpdate = true;
            }
            else if (this.props.maxTrig !== nextProps.maxTrig) {
                shouldUpdate = true;
            }
            else if (!currentFMMIsNull && !newFmmIsNull) {
                shouldUpdate = this.props.fed.fmm.url !== nextProps.fed.fmm.url;
            }
            shouldUpdate = shouldUpdate || !DAQViewUtility.snapshotElementsEqualShallow(this.props.fed, nextProps.fed);
            return shouldUpdate;
        };
        FEDData.prototype.render = function () {
            var drawZeroDataFlowComponent = this.props.drawZeroDataFlowComponent;
            var fed = this.props.fed;
            var trigNum = fed.eventCounter;
            var maxTrig = this.props.maxTrig;
            var trigNumDisplay = '';
            if (!fed.isPseudoFed
                && fed.hasSLINK && !fed.frlMasked
                && maxTrig > 0
                && trigNum != maxTrig
                && drawZeroDataFlowComponent) {
                trigNumDisplay = trigNum;
            }
            var minTrigClassNames = classNames('fb-table-fed-min-trig');
            var percentWarning = fed.percentWarning;
            var percentBusy = fed.percentBusy;
            var ttsState = fed.ttsState ? fed.ttsState.substring(0, 1) : '';
            var percentBackpressure = fed.percentBackpressure;
            var expectedSourceId = fed.srcIdExpected;
            var receivedSourceId = fed.srcIdReceived;
            var fedCRCErrors = fed.numFCRCerrors;
            var slinkCRCErrors = fed.numSCRCerrors;
            var percentWarningDisplay = percentWarning > 0 ?
                React.createElement("span", { className: "fb-table-fed-percent-warning" },
                    "W:",
                    percentWarning.toFixed(1),
                    "%") : '';
            var percentBusyDisplay = percentBusy > 0 ?
                React.createElement("span", { className: "fb-table-fed-percent-busy" },
                    "B:",
                    percentBusy.toFixed(1),
                    "%") : '';
            var ttsStateDisplay = (ttsState !== 'R' && ttsState.length !== 0) ? ttsState : '';
            var fedTTSStateLink = ttsState;
            if (fed.fmm != null && fed.fmm.url != null) {
                fedTTSStateLink = React.createElement("a", { href: fed.fmm.url + '/urn:xdaq-application:service=fmmcontroller', target: "_blank" }, ttsStateDisplay);
                ttsStateDisplay = fedTTSStateLink;
            }
            var ttsStateClass;
            var fedIdClasses = 'fb-table-fed-id';
            ttsStateClass = ttsStateDisplay.length !== 0 ? 'fb-table-fed-tts-state-' + ttsState : null;
            var displayFedId = false;
            var displayFedTTSState = false;
            /* Masking feds with SLINK - FRL masking*/
            if (fed.hasSLINK) {
                if (!fed.frlMasked) {
                    displayFedId = true;
                }
            }
            else if (fed.hasTTS) {
                if (!fed.fmmMasked) {
                    displayFedId = true;
                }
            }
            if (fed.hasTTS && !fed.fmmMasked) {
                displayFedTTSState = true;
            }
            else {
                ttsStateDisplay = '';
            }
            /* display FED id */
            if (displayFedId) {
                if (displayFedTTSState) {
                    fedIdClasses = classNames(fedIdClasses, ttsStateClass);
                }
            }
            else {
                /* Display TTS state - Special case */
                if (displayFedTTSState) {
                    fedIdClasses = classNames(fedIdClasses, 'fb-table-fed-special-case');
                    fedIdClasses = classNames(fedIdClasses, ttsStateClass);
                }
                else {
                    if (fed.frlMasked) {
                        fedIdClasses = classNames(fedIdClasses, 'fb-table-fed-frl-masked');
                    }
                    else if (fed.fmmMasked) {
                        fedIdClasses = classNames(fedIdClasses, 'fb-table-fed-tts-state-fmm-masked');
                    }
                }
            }
            var ttsStateClasses = classNames('fb-table-fed-tts-state', fedIdClasses);
            var percentBackpressureDisplay = percentBackpressure > 0 ?
                React.createElement("span", { className: "fb-table-fed-percent-backpressure" },
                    '<',
                    percentBackpressure.toFixed(1),
                    "%") : '';
            var unexpectedSourceIdDisplay = '';
            if (!(fed.frlMasked === true) && receivedSourceId != expectedSourceId && receivedSourceId != 0) {
                unexpectedSourceIdDisplay =
                    React.createElement("span", { className: "fb-table-fed-received-source-id" },
                        "rcvSrcId:",
                        receivedSourceId);
            }
            var fedCRCErrorDisplay = fedCRCErrors > 0 ?
                React.createElement("span", { className: "fb-table-fed-crc-errors" },
                    "#FCRC=",
                    fedCRCErrors) : '';
            var slinkCRCErrorDisplay = slinkCRCErrors > 0 ?
                React.createElement("span", { className: "fb-table-slink-crc-errors" },
                    "#SCRC=",
                    slinkCRCErrors) : '';
            return (React.createElement("span", { className: "fb-table-fed" },
                percentWarningDisplay,
                percentBusyDisplay,
                React.createElement("span", { className: ttsStateClasses }, ttsStateDisplay),
                React.createElement("span", { className: fedIdClasses }, expectedSourceId),
                React.createElement("span", { className: minTrigClassNames }, trigNumDisplay),
                percentBackpressureDisplay,
                unexpectedSourceIdDisplay,
                fedCRCErrorDisplay,
                slinkCRCErrorDisplay));
        };
        return FEDData;
    }(React.Component));
    var FEDBuilderTableSummaryRow = (function (_super) {
        __extends(FEDBuilderTableSummaryRow, _super);
        function FEDBuilderTableSummaryRow() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        FEDBuilderTableSummaryRow.prototype.shouldComponentUpdate = function (nextProps) {
            var shouldUpdate = false;
            shouldUpdate = shouldUpdate || this.props.numRus !== nextProps.numRus;
            shouldUpdate = shouldUpdate || this.props.numUsedRus !== nextProps.numUsedRus;
            shouldUpdate = shouldUpdate || this.props.drawPausedComponent !== nextProps.drawPausedComponent;
            shouldUpdate = shouldUpdate || this.props.drawZeroDataFlowComponent !== nextProps.drawZeroDataFlowComponent;
            shouldUpdate = shouldUpdate || this.props.drawStaleSnapshot !== nextProps.drawStaleSnapshot;
            shouldUpdate = shouldUpdate || !DAQViewUtility.snapshotElementsEqualShallow(this.props.fedBuilderSummary, nextProps.fedBuilderSummary);
            return shouldUpdate;
        };
        FEDBuilderTableSummaryRow.prototype.render = function () {
            var fedBuilderSummary = this.props.fedBuilderSummary;
            var drawPausedComponent = this.props.drawPausedComponent;
            var drawZeroDataFlowComponent = this.props.drawZeroDataFlowComponent;
            var drawStaleSnapshot = this.props.drawStaleSnapshot;
            var fbSummaryRowClass = drawPausedComponent ? "fb-table-fb-summary-row-paused" : "fb-table-fb-summary-row-running";
            var fragmentInRuClass = FormatUtility.getClassNameForNumber(fedBuilderSummary.sumFragmentsInRU != null ? fedBuilderSummary.sumFragmentsInRU : 0, FBTableNumberFormats.FRAGMENTS_IN_RU);
            var eventsInRuClass = FormatUtility.getClassNameForNumber(fedBuilderSummary.sumEventsInRU != null ? fedBuilderSummary.sumEventsInRU : 0, FBTableNumberFormats.EVENTS_IN_RU);
            var requestsClass = FormatUtility.getClassNameForNumber(fedBuilderSummary.sumRequests != null ? fedBuilderSummary.sumRequests : 0, FBTableNumberFormats.REQUESTS);
            if (drawZeroDataFlowComponent) {
                fbSummaryRowClass = "fb-table-fb-summary-row-ratezero";
                if (!drawStaleSnapshot) {
                    var escapeRedField = 'fb-table-ru-red-column-escape';
                    if (fragmentInRuClass === 'fb-table-ru-fragments-in-ru') {
                        fragmentInRuClass = escapeRedField;
                    }
                    if (eventsInRuClass === 'fb-table-ru-events-in-ru') {
                        eventsInRuClass = escapeRedField;
                    }
                    if (requestsClass === 'fb-table-ru-requests') {
                        requestsClass = escapeRedField;
                    }
                }
            }
            if (drawStaleSnapshot && (!drawPausedComponent)) {
                fbSummaryRowClass = 'fb-table-fb-summary-row-stale-page';
            }
            return (React.createElement("tr", { className: classNames(fbSummaryRowClass, "fb-table-fb-row-counter") },
                React.createElement("td", { colSpan: 12 }),
                React.createElement("td", null,
                    "\u03A3 ",
                    this.props.numUsedRus,
                    " / ",
                    this.props.numRus),
                React.createElement("td", null),
                React.createElement("td", null),
                React.createElement("td", { className: FormatUtility.getClassNameForNumber(fedBuilderSummary.rate != null ? fedBuilderSummary.rate / 100 : 0, FBTableNumberFormats.RATE) }, fedBuilderSummary.rate != null ? (fedBuilderSummary.rate / 1000).toFixed(3) : '*'),
                React.createElement("td", { className: FormatUtility.getClassNameForNumber(fedBuilderSummary.throughput != null ? fedBuilderSummary.throughput / 1000 / 1000 : 0, FBTableNumberFormats.THROUGHPUT) },
                    "\u03A3 ",
                    fedBuilderSummary.throughput != null ? (fedBuilderSummary.throughput / 1000 / 1000).toFixed(1) : '*'),
                React.createElement("td", { className: FormatUtility.getClassNameForNumber(fedBuilderSummary.superFragmentSizeMean != null ? fedBuilderSummary.superFragmentSizeMean / 1000 : 0, FBTableNumberFormats.SIZE) },
                    "\u03A3 ",
                    fedBuilderSummary.superFragmentSizeMean != null ? (fedBuilderSummary.superFragmentSizeMean / 1000).toFixed(1) : '*',
                    "\u00B1",
                    fedBuilderSummary.superFragmentSizeStddev != null ? (fedBuilderSummary.superFragmentSizeStddev / 1000).toFixed(1) : '*'),
                React.createElement("td", { className: FormatUtility.getClassNameForNumber(fedBuilderSummary.deltaEvents != null ? fedBuilderSummary.deltaEvents : 0, FBTableNumberFormats.EVENTS) },
                    "\u0394 ",
                    fedBuilderSummary.deltaEvents != null ? fedBuilderSummary.deltaEvents : '*'),
                React.createElement("td", { className: fragmentInRuClass },
                    "\u03A3 ",
                    fedBuilderSummary.sumFragmentsInRU != null ? fedBuilderSummary.sumFragmentsInRU : '*'),
                React.createElement("td", { className: eventsInRuClass },
                    "\u03A3 ",
                    fedBuilderSummary.sumEventsInRU != null ? fedBuilderSummary.sumEventsInRU : '*'),
                React.createElement("td", { className: requestsClass },
                    "\u03A3 ",
                    fedBuilderSummary.sumRequests != null ? fedBuilderSummary.sumRequests : '*')));
        };
        return FEDBuilderTableSummaryRow;
    }(React.Component));
})(DAQView || (DAQView = {}));
