"use strict";
/**
 * @author Michail Vougioukas
 * @author Philipp Brummer
 */
var DAQView;
(function (DAQView) {
    class FEDBuilderTable {
        constructor(htmlRootElementName) {
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
        setSnapshot(snapshot, drawPausedComponent, drawZeroDataFlowComponent, drawStaleSnapshot, url) {
            if (!snapshot) {
                let msg = "";
                let errRootElement = React.createElement(ErrorElement, { message: msg });
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
        }
        //to be called before setSnapshot
        prePassElementSpecificData(args) {
        }
        updateSnapshot() {
            let sortedSnapshot = this.sort(this.snapshot);
            let daq = sortedSnapshot.getDAQ();
            let drawPausedComponent = this.drawPausedComponent;
            let drawZeroDataFlowComponent = this.drawZeroDataFlowComponent;
            let drawStaleSnapshot = this.drawStaleSnapshot;
            let tcdsControllerUrl = daq.tcdsGlobalInfo.tcdsControllerContext;
            let tcdsControllerServiceName = daq.tcdsGlobalInfo.tcdsControllerServiceName;
            let fedBuilderTableRootElement = React.createElement(FEDBuilderTableElement, { tableObject: this, fedBuilders: daq.fedBuilders, fedBuilderSummary: daq.fedBuilderSummary, drawPausedComponent: drawPausedComponent, drawZeroDataFlowComponent: drawZeroDataFlowComponent, tcdsControllerUrl: tcdsControllerUrl, tcdsControllerServiceName: tcdsControllerServiceName, drawStaleSnapshot: drawStaleSnapshot });
            ReactDOM.render(fedBuilderTableRootElement, this.htmlRootElement);
        }
        setSortFunction(sortFunctions) {
            let presortFunction;
            let sortFunction;
            if (sortFunctions.hasOwnProperty('presort')) {
                presortFunction = sortFunctions.presort;
            }
            else {
                presortFunction = this.DEFAULT_PRESORT_FUNCTION;
            }
            sortFunction = sortFunctions.sort;
            this.sortFunction = { presort: presortFunction, sort: sortFunction };
            this.updateSnapshot();
        }
        sort(snapshot) {
            return this.sortFunction.sort(this.sortFunction.presort(snapshot));
        }
        setCurrentSorting(headerName, sorting) {
            DAQViewUtility.forEachOwnObjectProperty(this.currentSorting, (header) => this.currentSorting[header] = DAQView.Sorting.None);
            this.currentSorting[headerName] = sorting;
        }
        getCurrentSorting(headerName) {
            return this.currentSorting[headerName];
        }
    }
    DAQView.FEDBuilderTable = FEDBuilderTable;
    class ErrorElement extends React.Component {
        render() {
            return (React.createElement("div", null, this.props.message));
        }
    }
    let FBTableNumberFormats;
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
    let FBTableSortFunctions;
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
                let firstFedId = firstFed.srcIdExpected;
                let secondFedId = secondFed.srcIdExpected;
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
            let daq = snapshot.getDAQ();
            let fedBuilders = daq.fedBuilders;
            fedBuilders.forEach(function (fedBuilder) {
                fedBuilder.subFedbuilders.forEach(function (subFedBuilder) {
                    FedsById(subFedBuilder.feds, descending);
                });
            });
            return snapshot;
        }
        function FrlsByGeoslot(snapshot, descending) {
            let daq = snapshot.getDAQ();
            let fedBuilders = daq.fedBuilders;
            // sort the FRLs of each SubFEDBuilder, of each FEDBuilder by their FRL geoslot
            fedBuilders.forEach(function (fedBuilder) {
                fedBuilder.subFedbuilders.forEach(function (subFEDBuilder) {
                    subFEDBuilder.frls.sort(function (firstFrl, secondFrl) {
                        let firstFrlGeoslot = firstFrl.geoSlot;
                        let secondFrlGeoslot = secondFrl.geoSlot;
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
            let daq = snapshot.getDAQ();
            let fedBuilders = daq.fedBuilders;
            // sort the SubFEDBuilders of each FEDBuilder by their TTCP name
            fedBuilders.forEach(function (fedBuilder) {
                fedBuilder.subFedbuilders.sort(function (firstSubFedBuilder, secondSubFedBuilder) {
                    let firstSubFedBuilderTTCPName = firstSubFedBuilder.ttcPartition.name;
                    let secondSubFedBuilderTTCPName = secondSubFedBuilder.ttcPartition.name;
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
            let daq = snapshot.getDAQ();
            let fedBuilders = daq.fedBuilders;
            // sort the SubFEDBuilders of each FEDBuilder by their TTS percentage busy
            fedBuilders.forEach(function (fedBuilder) {
                fedBuilder.subFedbuilders.sort(function (firstSubFedBuilder, secondSubFedBuilder) {
                    let firstSubFedBuilderTTSBusy = firstSubFedBuilder.ttcPartition.percentBusy;
                    let secondSubFedBuilderTTSBusy = secondSubFedBuilder.ttcPartition.percentBusy;
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
            let daq = snapshot.getDAQ();
            let fedBuilders = daq.fedBuilders;
            // sort the SubFEDBuilders of each FEDBuilder by their TTS percentage warning
            fedBuilders.forEach(function (fedBuilder) {
                fedBuilder.subFedbuilders.sort(function (firstSubFedBuilder, secondSubFedBuilder) {
                    let firstSubFedBuilderTTSWarning = firstSubFedBuilder.ttcPartition.percentWarning;
                    let secondSubFedBuilderTTSWarning = secondSubFedBuilder.ttcPartition.percentWarning;
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
            let daq = snapshot.getDAQ();
            let fedBuilders = daq.fedBuilders;
            // sort the FEDBuilders based on their first SubFEDBuilders TTCP name
            fedBuilders.sort(function (firstFedBuilder, secondFedBuilder) {
                if (firstFedBuilder.ru.isEVM) {
                    return -1;
                }
                else if (secondFedBuilder.ru.isEVM) {
                    return 1;
                }
                let firstFedBuilderFirstTTCPName = firstFedBuilder.subFedbuilders[0].ttcPartition.name;
                let secondFedBuilderFirstTTCPName = secondFedBuilder.subFedbuilders[0].ttcPartition.name;
                if (firstFedBuilderFirstTTCPName > secondFedBuilderFirstTTCPName) {
                    return (descending ? -1 : 1);
                }
                else if (firstFedBuilderFirstTTCPName < secondFedBuilderFirstTTCPName) {
                    return (descending ? 1 : -1);
                }
                else {
                    // if the first TTCP name of both FEDBuilders is the same, sort
                    let firstFedBuilderName = firstFedBuilder.name;
                    let secondFedBuilderName = secondFedBuilder.name;
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
            let daq = snapshot.getDAQ();
            let fedBuilders = daq.fedBuilders;
            // sort by FEDBuilder name
            fedBuilders.sort(function (firstFedBuilder, secondFedBuilder) {
                if (firstFedBuilder.ru.isEVM) {
                    return -1;
                }
                else if (secondFedBuilder.ru.isEVM) {
                    return 1;
                }
                let firstFedBuilderName = firstFedBuilder.name;
                let secondFedBuilderName = secondFedBuilder.name;
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
            let daq = snapshot.getDAQ();
            let fedBuilders = daq.fedBuilders;
            // sort the FEDBuilders based on their top subFEDBuilder's TTCP busy status percentage
            fedBuilders.sort(function (firstFedBuilder, secondFedBuilder) {
                if (firstFedBuilder.ru.isEVM) {
                    return -1;
                }
                else if (secondFedBuilder.ru.isEVM) {
                    return 1;
                }
                let firstFedBuilderFirstTTCPBusy = firstFedBuilder.subFedbuilders[0].ttcPartition.percentBusy;
                let secondFedBuilderFirstTTCPBusy = secondFedBuilder.subFedbuilders[0].ttcPartition.percentBusy;
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
            let daq = snapshot.getDAQ();
            let fedBuilders = daq.fedBuilders;
            // sort the FEDBuilders based on their top subFEDBuilder's TTCP warning status percentage
            fedBuilders.sort(function (firstFedBuilder, secondFedBuilder) {
                if (firstFedBuilder.ru.isEVM) {
                    return -1;
                }
                else if (secondFedBuilder.ru.isEVM) {
                    return 1;
                }
                let firstFedBuilderFirstTTCPWarning = firstFedBuilder.subFedbuilders[0].ttcPartition.percentWarning;
                let secondFedBuilderFirstTTCPWarning = secondFedBuilder.subFedbuilders[0].ttcPartition.percentWarning;
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
            let daq = snapshot.getDAQ();
            let fedBuilders = daq.fedBuilders;
            // sort the FEDBuilders based on their RU rate
            fedBuilders.sort(function (firstFedBuilder, secondFedBuilder) {
                if (firstFedBuilder.ru.isEVM) {
                    return -1;
                }
                else if (secondFedBuilder.ru.isEVM) {
                    return 1;
                }
                let firstFedBuilderRURate = firstFedBuilder.ru.rate;
                let secondFedBuilderRURate = secondFedBuilder.ru.rate;
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
            let daq = snapshot.getDAQ();
            let fedBuilders = daq.fedBuilders;
            // sort the FEDBuilders based on their RU throughput
            fedBuilders.sort(function (firstFedBuilder, secondFedBuilder) {
                if (firstFedBuilder.ru.isEVM) {
                    return -1;
                }
                else if (secondFedBuilder.ru.isEVM) {
                    return 1;
                }
                let firstFedBuilderRUHostname = firstFedBuilder.ru.hostname;
                let secondFedBuilderRUHostname = secondFedBuilder.ru.hostname;
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
            let daq = snapshot.getDAQ();
            let fedBuilders = daq.fedBuilders;
            // sort the FEDBuilders based on their RU throughput
            fedBuilders.sort(function (firstFedBuilder, secondFedBuilder) {
                if (firstFedBuilder.ru.isEVM) {
                    return -1;
                }
                else if (secondFedBuilder.ru.isEVM) {
                    return 1;
                }
                let firstFedBuilderRUThroughput = firstFedBuilder.ru.throughput;
                let secondFedBuilderRUThroughput = secondFedBuilder.ru.throughput;
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
            let daq = snapshot.getDAQ();
            let fedBuilders = daq.fedBuilders;
            // sort the FEDBuilders based on their RU size
            fedBuilders.sort(function (firstFedBuilder, secondFedBuilder) {
                if (firstFedBuilder.ru.isEVM) {
                    return -1;
                }
                else if (secondFedBuilder.ru.isEVM) {
                    return 1;
                }
                let firstFedBuilderRUSize = firstFedBuilder.ru.superFragmentSizeMean;
                let secondFedBuilderRUSize = secondFedBuilder.ru.superFragmentSizeMean;
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
            let daq = snapshot.getDAQ();
            let fedBuilders = daq.fedBuilders;
            // sort the FEDBuilders based on their RU number of fragments in RU
            fedBuilders.sort(function (firstFedBuilder, secondFedBuilder) {
                if (firstFedBuilder.ru.isEVM) {
                    return -1;
                }
                else if (secondFedBuilder.ru.isEVM) {
                    return 1;
                }
                let firstFedBuilderRUNumfrag = firstFedBuilder.ru.fragmentsInRU;
                let secondFedBuilderRUNumfrag = secondFedBuilder.ru.fragmentsInRU;
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
            let daq = snapshot.getDAQ();
            let fedBuilders = daq.fedBuilders;
            // sort the FEDBuilders based on their RU number of events in RU
            fedBuilders.sort(function (firstFedBuilder, secondFedBuilder) {
                if (firstFedBuilder.ru.isEVM) {
                    return -1;
                }
                else if (secondFedBuilder.ru.isEVM) {
                    return 1;
                }
                let firstFedBuilderRUNumevts = firstFedBuilder.ru.eventsInRU;
                let secondFedBuilderRUNumevts = secondFedBuilder.ru.eventsInRU;
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
            let daq = snapshot.getDAQ();
            let fedBuilders = daq.fedBuilders;
            // sort the FEDBuilders based on their RU number of events in RU
            fedBuilders.sort(function (firstFedBuilder, secondFedBuilder) {
                if (firstFedBuilder.ru.isEVM) {
                    return -1;
                }
                else if (secondFedBuilder.ru.isEVM) {
                    return 1;
                }
                let firstFedBuilderRUNumevts = firstFedBuilder.ru.eventCount;
                let secondFedBuilderRUNumevts = secondFedBuilder.ru.eventCount;
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
            let daq = snapshot.getDAQ();
            let fedBuilders = daq.fedBuilders;
            // sort the FEDBuilders based on their RU number of requests
            fedBuilders.sort(function (firstFedBuilder, secondFedBuilder) {
                if (firstFedBuilder.ru.isEVM) {
                    return -1;
                }
                else if (secondFedBuilder.ru.isEVM) {
                    return 1;
                }
                let firstFedBuilderRURequests = firstFedBuilder.ru.requests;
                let secondFedBuilderRURequests = secondFedBuilder.ru.requests;
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
    const FB_TABLE_BASE_HEADERS = [
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
    const FB_TABLE_TOP_HEADERS = FB_TABLE_BASE_HEADERS.slice();
    FB_TABLE_TOP_HEADERS.unshift({
        content: 'TTCP',
        sortFunctions: {
            Ascending: { presort: FBTableSortFunctions.NONE, sort: FBTableSortFunctions.TTCP_ASC },
            Descending: { presort: FBTableSortFunctions.NONE, sort: FBTableSortFunctions.TTCP_DESC }
        }
    });
    const FB_TABLE_SUMMARY_HEADERS = FB_TABLE_BASE_HEADERS.slice();
    FB_TABLE_SUMMARY_HEADERS.unshift({ content: 'Summary' });
    class FEDBuilderTableElement extends React.Component {
        render() {
            let fedBuilders = this.props.fedBuilders;
            let drawPausedComponents = this.props.drawPausedComponent;
            let drawZeroDataFlowComponents = this.props.drawZeroDataFlowComponent;
            let drawStaleSnapshot = this.props.drawStaleSnapshot;
            let tcdsControllerUrl = this.props.tcdsControllerUrl;
            let tcdsControllerServiceName = this.props.tcdsControllerServiceName;
            let evmMaxTrg = null;
            //can similarly invent and pass down the evm minTrg here, for comparison at innermost levels
            fedBuilders.forEach(function (fedBuilder) {
                if (fedBuilder.ru != null && fedBuilder.ru.isEVM) {
                    if (fedBuilder.subFedbuilders != null && fedBuilder.subFedbuilders.length > 0) {
                        evmMaxTrg = fedBuilder.subFedbuilders[0].maxTrig;
                    }
                }
            });
            let fedBuilderRows = [];
            fedBuilders.forEach(function (fedBuilder) {
                let index = fedBuilderRows.length;
                let oddRow = (index % 2 == 1) ? true : false;
                fedBuilderRows.push(React.createElement(FEDBuilderRow, { key: fedBuilder['@id'], fedBuilder: fedBuilder, evmMaxTrg: evmMaxTrg, drawPausedComponent: drawPausedComponents, drawZeroDataFlowComponent: drawZeroDataFlowComponents, tcdsControllerUrl: tcdsControllerUrl, tcdsControllerServiceName: tcdsControllerServiceName, oddRow: oddRow, drawStaleSnapshot: drawStaleSnapshot }));
            });
            let fedBuilderSummary = this.props.fedBuilderSummary;
            let numRus = fedBuilders.length;
            let numUsedRus = numRus - fedBuilderSummary.rusMasked;
            let tableObject = this.props.tableObject;
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
        }
    }
    class RUWarningData extends React.Component {
        render() {
            let warnMsg = '';
            let ruWarningData = [];
            let ru = this.props.ru;
            if (ru.stateName != 'Halted' && ru.stateName != 'Ready' && ru.stateName != 'Enabled') {
                warnMsg += ru.stateName + ' ';
            }
            let fedsWithErrors = ru.fedsWithErrors;
            let addTtcpPrefix = (ru.fedBuilder.subFedbuilders.length > 1);
            let fedWithErrors;
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
                let errorString = '';
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
        }
    }
    class FEDBuilderRow extends React.Component {
        render() {
            let drawPausedComponent = this.props.drawPausedComponent;
            let drawZeroDataFlowComponent = this.props.drawZeroDataFlowComponent;
            let drawStaleSnapshot = this.props.drawStaleSnapshot;
            let oddRow = this.props.oddRow;
            let fedBuilder = this.props.fedBuilder;
            let subFedBuilders = fedBuilder.subFedbuilders;
            let numSubFedBuilders = subFedBuilders.length;
            let ru = fedBuilder.ru;
            let ruMasked = ru.masked;
            let ruHostname = ru.hostname;
            let ruPort = ru.port;
            let ruName = ruHostname.split(".")[0];
            ruName = ruName.indexOf('ru') == 0 ? ruName.substring(3) : ruName;
            let ruUrl = 'http://' + ruHostname + ':' + ruPort + '/urn:xdaq-application:service=' + (ru.isEVM ? 'evm' : 'ru');
            let ruUrlDisplay = ruName;
            let ruUrlDisplayClass = "fb-table-stale-member-wrapbox"; //assume stale and overwrite if not
            let ruDebug = ru.isEVM ? "Check problems with EVM flashlist!" : "Check problems with RU flashlist!";
            if (ruPort > 0) {
                ruUrlDisplay = React.createElement("a", { href: ruUrl, target: "_blank" }, ruName);
                ruUrlDisplayClass = "";
                ruDebug = "";
            }
            let ruState = '';
            let ruStateClass = 'fb-table-ru-state-normal';
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
            let ruJobCrashStateDisplay = "";
            let ruJobCrashStateDisplayClass = "";
            if (ru.crashed) {
                ruJobCrashStateDisplay = "JobCrash";
                ruJobCrashStateDisplayClass = "fb-table-jobcrash";
            }
            let fbRowZeroEvmRateClass = "";
            if (drawZeroDataFlowComponent && fedBuilder.ru.isEVM) {
                fbRowZeroEvmRateClass = "fb-table-fb-evm-row-ratezero";
            }
            let fbRowRateClass = classNames(fbRowZeroEvmRateClass, FormatUtility.getClassNameForNumber(ru.rate, FBTableNumberFormats.RATE));
            let fedBuilderData = [];
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
            let sizeClass;
            let eventCountClass;
            let fragmentInRuClass;
            let eventsInRuClass;
            let requestsClass;
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
                let escapeRedField = 'fb-table-ru-red-column-escape';
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
            let superFragmentSizePrecision = (ru.superFragmentSizeMean > 1000) ? 1 : 3;
            fedBuilderData.push(React.createElement("td", { rowSpan: numSubFedBuilders, className: sizeClass },
                (ru.superFragmentSizeMean / 1000).toFixed(superFragmentSizePrecision),
                "\u00B1",
                (ru.superFragmentSizeStddev / 1000).toFixed(superFragmentSizePrecision)));
            fedBuilderData.push(React.createElement("td", { rowSpan: numSubFedBuilders, className: eventCountClass }, ru.eventCount));
            fedBuilderData.push(React.createElement("td", { rowSpan: numSubFedBuilders, className: fragmentInRuClass }, ru.fragmentsInRU));
            fedBuilderData.push(React.createElement("td", { rowSpan: numSubFedBuilders, className: eventsInRuClass }, ru.eventsInRU));
            fedBuilderData.push(React.createElement("td", { rowSpan: numSubFedBuilders, className: requestsClass }, ru.requests));
            let fbRowClass = drawPausedComponent ? "fb-table-fb-row-paused" : "fb-table-fb-row-running";
            if (drawZeroDataFlowComponent) {
                fbRowClass = "fb-table-fb-row-ratezero";
            }
            if (drawStaleSnapshot && (!drawPausedComponent)) {
                fbRowClass = 'fb-table-fb-row-stale-page-row';
            }
            let fbRowClassName = classNames(fbRowClass, this.props.additionalClasses);
            let children = [];
            let count = 0;
            subFedBuilders.forEach(subFedBuilder => children.push(React.createElement(SubFEDBuilderRow, { evmMaxTrg: this.props.evmMaxTrg, subFedBuilder: subFedBuilder, additionalContent: ++count == 1 ? fedBuilderData : null, tcdsControllerUrl: this.props.tcdsControllerUrl, tcdsControllerServiceName: this.props.tcdsControllerServiceName, drawZeroDataFlowComponent: drawZeroDataFlowComponent })));
            return (React.createElement("tbody", { className: fbRowClassName }, children));
        }
    }
    class FEDBuilderTableTopHeaderRow extends React.Component {
        shouldComponentUpdate() {
            return false;
        }
        render() {
            let drawPausedComponent = this.props.drawPausedComponent;
            return (React.createElement("tr", { className: "fb-table-top-header-row" },
                React.createElement(FEDBuilderTableHeader, { additionalClasses: "fb-table-help", content: React.createElement("a", { href: "fbtablehelp.html", target: "_blank" }, "Table Help"), colSpan: 1, drawPausedComponent: drawPausedComponent }),
                React.createElement(FEDBuilderTableHeader, { content: "F  E  D  B  U  I  L  D  E  R", colSpan: 11, drawPausedComponent: drawPausedComponent }),
                React.createElement(FEDBuilderTableHeader, { content: "E  V  B", colSpan: 10, drawPausedComponent: drawPausedComponent })));
        }
    }
    class FEDBuilderTableSecondaryHeaderRow extends React.Component {
        shouldComponentUpdate() {
            return false;
        }
        render() {
            let drawPausedComponent = this.props.drawPausedComponent;
            return (React.createElement("tr", { className: "fb-table-secondary-header-row" },
                React.createElement(FEDBuilderTableHeader, { content: "", colSpan: 1, drawPausedComponent: drawPausedComponent }),
                React.createElement(FEDBuilderTableHeader, { content: "T T S", colSpan: 3, drawPausedComponent: drawPausedComponent }),
                React.createElement(FEDBuilderTableHeader, { content: "", colSpan: 18, drawPausedComponent: drawPausedComponent })));
        }
    }
    class FEDBuilderTableHeaderRow extends React.Component {
        render() {
            let drawPausedComponent = this.props.drawPausedComponent;
            let tableObject = this.props.tableObject;
            let children = [];
            this.props.headers.forEach(header => children.push(React.createElement(FEDBuilderTableHeader, { key: header.content, content: header.content, colSpan: header.colSpan, additionalClasses: header.additionalClasses, tableObject: tableObject, sorting: tableObject.getCurrentSorting(header.content), sortFunctions: header.sortFunctions, drawPausedComponent: drawPausedComponent })));
            return (React.createElement("tr", { className: "fb-table-header-row" }, children));
        }
    }
    class FEDBuilderTableHeader extends React.Component {
        shouldComponentUpdate(nextProps) {
            return this.props.sorting !== nextProps.sorting;
        }
        render() {
            let drawPausedComponent = this.props.drawPausedComponent;
            let content = this.props.content;
            let colSpan = this.props.colSpan;
            let additionalClasses = this.props.additionalClasses;
            let fbHeaderClass = "fb-table-header";
            let className = classNames(fbHeaderClass, additionalClasses);
            let tableObject = this.props.tableObject;
            let currentSorting = this.props.sorting ? this.props.sorting : null;
            let sortFunctions = this.props.sortFunctions;
            let isSortable = (tableObject != null && sortFunctions != null);
            let clickFunction = null;
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
            let sortingImage = null;
            if (currentSorting != null) {
                sortingImage = React.createElement("input", { type: "image", className: "fb-table-sort-image", src: 'dist/img/' + currentSorting.getImagePath(), alt: currentSorting.toString(), title: "Sort", onClick: clickFunction });
            }
            return (React.createElement("th", { className: className, colSpan: colSpan ? colSpan : 1 },
                content,
                sortingImage));
        }
    }
    class SubFEDBuilderRow extends React.Component {
        render() {
            let drawZeroDataFlowComponent = this.props.drawZeroDataFlowComponent;
            let subFedBuilder = this.props.subFedBuilder;
            let frlPc = subFedBuilder.frlPc;
            let frlPcHostname = frlPc.hostname;
            let frlPcPort = frlPc.port;
            let frlPcName = frlPcHostname.split(".")[0];
            frlPcName = frlPcName.indexOf('frlpc') == 0 && frlPcName.indexOf('frlpc40') == -1 ? frlPcName.substring(6) : frlPcName;
            frlPcName = frlPcName.indexOf('frlpc40') == 0 ? frlPcName.substring(8) : frlPcName;
            let frlPcUrl = 'http://' + frlPcHostname + ':' + frlPcPort;
            let frls = subFedBuilder.frls;
            let pseudoFeds = subFedBuilder.feds;
            let frlPcUrlDisplay = frlPcName;
            let frlPcUrlDisplayClass = "fb-table-stale-member-wrapbox"; //assume stale and overwrite if not
            let frlPcDebug = "Check problems with FEROL_CONFIGURATION flashlist!";
            if (frlPcPort > 0) {
                frlPcUrlDisplay = React.createElement("a", { href: frlPcUrl, target: "_blank" }, frlPcName);
                frlPcUrlDisplayClass = "";
                frlPcDebug = "";
            }
            let additionalClasses = this.props.additionalClasses;
            let className = classNames("fb-table-subfb-row", additionalClasses);
            let ttcPartition = subFedBuilder.ttcPartition;
            let ttsState = '';
            let ttsStateTcdsPm = ttcPartition.tcds_pm_ttsState ? ttcPartition.tcds_pm_ttsState.substring(0, 1) : 'x';
            let ttsStateTcdsApvPm = ttcPartition.tcds_apv_pm_ttsState ? ttcPartition.tcds_apv_pm_ttsState.substring(0, 1) : 'x';
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
            let ttsStateClasses = ttcPartition.ttsState ? 'fb-table-subfb-tts-state-' + ttsState : 'fb-table-subfb-tts-state-none';
            ttsStateClasses = classNames(ttsStateClasses, 'fb-table-subfb-tts-state');
            let ttsStateTcdsPmClasses = ttcPartition.tcds_pm_ttsState || ttcPartition.tcds_pm_ttsState != '-' ? 'fb-table-subfb-tts-state-' + ttsStateTcdsPm : 'fb-table-subfb-tts-state-none';
            ttsStateTcdsPmClasses = classNames(ttsStateTcdsPmClasses, 'fb-table-subfb-tts-state');
            let ttsStateTcdsApvClasses = ttcPartition.tcds_apv_pm_ttsState || ttcPartition.tcds_apv_pm_ttsState != '-' ? 'fb-table-subfb-tts-state-' + ttsStateTcdsApvPm : 'fb-table-subfb-tts-state-none';
            ttsStateTcdsApvClasses = classNames(ttsStateTcdsApvClasses, 'fb-table-subfb-tts-state');
            let minTrig = subFedBuilder.minTrig;
            let maxTrig = subFedBuilder.maxTrig;
            let minTrigUnequalMaxTrig = minTrig != maxTrig;
            let maxTrigSet = maxTrig >= 0;
            let ttcPartitionTTSStateLink = ttsState;
            if (ttcPartition.fmm != null && ttcPartition.fmm.url != null && ttsState != '-' && ttsState != 'x' && ttsState.substring(0, 2) != 'no' && ttsState != '?') {
                ttcPartitionTTSStateLink =
                    React.createElement("a", { href: ttcPartition.fmm.url + '/urn:xdaq-application:service=fmmcontroller', target: "_blank", title: ttcPartition.ttsState }, ttsState);
            }
            let tcdsControllerUrl = this.props.tcdsControllerUrl;
            let tcdsControllerServiceName = this.props.tcdsControllerServiceName;
            let ttcPartitionTTSStateTcdsPmLink = ttsStateTcdsPm;
            if (ttcPartition.tcds_pm_ttsState != null && ttcPartition.tcds_pm_ttsState != '-' && ttsStateTcdsPm != '-' && ttcPartition.tcds_pm_ttsState != 'x' && ttcPartition.tcds_pm_ttsState.substring(0, 2) != 'no') {
                ttcPartitionTTSStateTcdsPmLink =
                    React.createElement("a", { href: tcdsControllerUrl + '/urn:xdaq-application:service=' + tcdsControllerServiceName, target: "_blank", title: ttcPartition.tcds_pm_ttsState }, ttsStateTcdsPm);
            }
            let ttcPartitionTTSStateTcdsApvPmLink = ttsStateTcdsApvPm;
            if (ttcPartition.tcds_apv_pm_ttsState != null && ttcPartition.tcds_apv_pm_ttsState != '-' && ttsStateTcdsApvPm != '-' && ttcPartition.tcds_apv_pm_ttsState != 'x' && ttcPartition.tcds_pm_ttsState.substring(0, 2) != 'no') {
                ttcPartitionTTSStateTcdsApvPmLink =
                    React.createElement("a", { href: tcdsControllerUrl + '/urn:xdaq-application:service=' + tcdsControllerServiceName, target: "_blank", title: ttcPartition.tcds_apv_pm_ttsState }, ttsStateTcdsApvPm);
            }
            let ttcPartitionTTSStateDisplay_F = React.createElement("span", { className: ttsStateClasses }, ttcPartitionTTSStateLink);
            let ttcPartitionTTSStateDisplay_P = React.createElement("span", { className: ttsStateTcdsPmClasses }, ttcPartitionTTSStateTcdsPmLink);
            let ttcPartitionTTSStateDisplay_A = React.createElement("span", { className: ttsStateTcdsApvClasses }, ttcPartitionTTSStateTcdsApvPmLink);
            let ttcpPercWarn = ttcPartition.percentWarning != null ? ttcPartition.percentWarning.toFixed(1) : '-';
            let ttcpPercBusy = ttcPartition.percentWarning != null ? ttcPartition.percentBusy.toFixed(1) : '-';
            //on special cases of ttsState, percentages cannot be retrieved, therefore assign them the special state
            if (ttsState === '-' || ttsState === 'x' || ttsState === '?') {
                ttcpPercWarn = ttsState;
                ttcpPercBusy = ttsState;
            }
            if (ttcPartition.topFMMInfo && ttcPartition.topFMMInfo.nullCause) {
                ttcpPercWarn = ttcPartition.topFMMInfo.nullCause;
                ttcpPercBusy = ttcPartition.topFMMInfo.nullCause;
            }
            let evmMaxTrg = this.props.evmMaxTrg;
            let minTrigDisplayContent = '';
            let maxTrigDisplayContent = maxTrigSet ? maxTrig : '';
            if (minTrigUnequalMaxTrig) {
                minTrigDisplayContent = minTrig;
            }
            let minTrigClassNames = 'fb-table-subfb-min-trig';
            let maxTrigClassNames = 'fb-table-subfb-max-trig';
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
            let frlpcStateDisplay = "";
            let frlpcStateDisplayClass = "";
            if (frlPc.crashed) {
                frlpcStateDisplay = "JobCrash";
                frlpcStateDisplayClass = "fb-table-jobcrash";
            }
            let fmmAppStateDisplay = "";
            let fmmAppStateDisplayClass = "";
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
        }
    }
    class FRLs extends React.Component {
        render() {
            let frls = this.props.frls;
            let ttcPartition = this.props.ttcPartition;
            let maxTrig = this.props.maxTrig;
            let drawZeroDataFlowComponent = this.props.drawZeroDataFlowComponent;
            let pseudoFEDs = this.props.pseudoFeds;
            let fedData = [];
            let firstFrl = true;
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
        }
    }
    class FRL extends React.Component {
        render() {
            let frl = this.props.frl;
            let drawZeroDataFlowComponent = this.props.drawZeroDataFlowComponent;
            let maxTrig = this.props.maxTrig;
            let ttcPartition = this.props.ttcPartition;
            let feds = frl.feds;
            let firstFed = feds && feds.hasOwnProperty("0") ? feds["0"] : null;
            let firstFedDisplay = firstFed && firstFed.ttcp.name === ttcPartition.name ? React.createElement(FEDData, { key: firstFed['@id'], fed: firstFed, maxTrig: maxTrig, drawZeroDataFlowComponent: drawZeroDataFlowComponent }) : '-';
            let secondFed = feds && feds.hasOwnProperty("1") ? feds["1"] : null;
            let secondFedDisplay = secondFed && secondFed.ttcp.name === ttcPartition.name ? React.createElement(FEDData, { key: secondFed['@id'], fed: secondFed, maxTrig: maxTrig, drawZeroDataFlowComponent: drawZeroDataFlowComponent }) : '';
            let thirdFed = feds && feds.hasOwnProperty("2") ? feds["2"] : null;
            let thirdFedDisplay = thirdFed && thirdFed.ttcp.name === ttcPartition.name ? React.createElement(FEDData, { key: thirdFed['@id'], fed: thirdFed, maxTrig: maxTrig, drawZeroDataFlowComponent: drawZeroDataFlowComponent }) : '';
            let fourthFed = feds && feds.hasOwnProperty("3") ? feds["3"] : null;
            let fourthFedDisplay = fourthFed && fourthFed.ttcp.name === ttcPartition.name ? React.createElement(FEDData, { key: fourthFed['@id'], fed: fourthFed, maxTrig: maxTrig, drawZeroDataFlowComponent: drawZeroDataFlowComponent }) : '';
            let secondFedShown = secondFed && (secondFed && secondFed.ttcp.name === ttcPartition.name);
            let thirdFedShown = thirdFed && (thirdFed && thirdFed.ttcp.name === ttcPartition.name);
            let fourthFedShown = fourthFed && (fourthFed && fourthFed.ttcp.name === ttcPartition.name);
            let firstFrl = this.props.firstFrl;
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
        }
    }
    class FEDData extends React.Component {
        shouldComponentUpdate(nextProps) {
            let shouldUpdate = false;
            let currentFMMIsNull = this.props.fed.fmm == null;
            let newFmmIsNull = nextProps.fed.fmm == null;
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
        }
        render() {
            let drawZeroDataFlowComponent = this.props.drawZeroDataFlowComponent;
            let fed = this.props.fed;
            let trigNum = fed.eventCounter;
            let maxTrig = this.props.maxTrig;
            let trigNumDisplay = '';
            if (!fed.isPseudoFed
                && fed.hasSLINK && !fed.frlMasked
                && maxTrig > 0
                && trigNum != maxTrig
                && drawZeroDataFlowComponent) {
                trigNumDisplay = trigNum;
            }
            let minTrigClassNames = classNames('fb-table-fed-min-trig');
            let percentWarning = fed.percentWarning;
            let percentBusy = fed.percentBusy;
            let ttsState = fed.ttsState ? fed.ttsState.substring(0, 1) : '';
            let percentBackpressure = fed.percentBackpressure;
            let expectedSourceId = fed.srcIdExpected;
            let receivedSourceId = fed.srcIdReceived;
            let fedCRCErrors = fed.numFCRCerrors;
            let slinkCRCErrors = fed.numSCRCerrors;
            let percentWarningDisplay = percentWarning > 0 ?
                React.createElement("span", { className: "fb-table-fed-percent-warning" },
                    "W:",
                    percentWarning.toFixed(1),
                    "%") : '';
            let percentBusyDisplay = percentBusy > 0 ?
                React.createElement("span", { className: "fb-table-fed-percent-busy" },
                    "B:",
                    percentBusy.toFixed(1),
                    "%") : '';
            let ttsStateDisplay = (ttsState !== 'R' && ttsState.length !== 0) ? ttsState : '';
            let fedTTSStateLink = ttsState;
            if (fed.fmm != null && fed.fmm.url != null) {
                fedTTSStateLink = React.createElement("a", { href: fed.fmm.url + '/urn:xdaq-application:service=fmmcontroller', target: "_blank" }, ttsStateDisplay);
                ttsStateDisplay = fedTTSStateLink;
            }
            let ttsStateClass;
            let fedIdClasses = 'fb-table-fed-id';
            ttsStateClass = ttsStateDisplay.length !== 0 ? 'fb-table-fed-tts-state-' + ttsState : null;
            let displayFedId = false;
            let displayFedTTSState = false;
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
            let ttsStateClasses = classNames('fb-table-fed-tts-state', fedIdClasses);
            let percentBackpressureDisplay = '';
            let unexpectedSourceIdDisplay = '';
            let fedCRCErrorDisplay = '';
            let slinkCRCErrorDisplay = '';
            if (displayFedId) {
                percentBackpressureDisplay = percentBackpressure > 0 ?
                    React.createElement("span", { className: "fb-table-fed-percent-backpressure" },
                        '<',
                        percentBackpressure.toFixed(1),
                        "%") : '';
                if (receivedSourceId != expectedSourceId && receivedSourceId != 0) {
                    unexpectedSourceIdDisplay =
                        React.createElement("span", { className: "fb-table-fed-received-source-id" },
                            "rcvSrcId:",
                            receivedSourceId);
                }
                fedCRCErrorDisplay = fedCRCErrors > 0 ?
                    React.createElement("span", { className: "fb-table-fed-crc-errors" },
                        "#FCRC=",
                        fedCRCErrors) : '';
                slinkCRCErrorDisplay = slinkCRCErrors > 0 ?
                    React.createElement("span", { className: "fb-table-slink-crc-errors" },
                        "#SCRC=",
                        slinkCRCErrors) : '';
            }
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
        }
    }
    class FEDBuilderTableSummaryRow extends React.Component {
        shouldComponentUpdate(nextProps) {
            let shouldUpdate = false;
            shouldUpdate = shouldUpdate || this.props.numRus !== nextProps.numRus;
            shouldUpdate = shouldUpdate || this.props.numUsedRus !== nextProps.numUsedRus;
            shouldUpdate = shouldUpdate || this.props.drawPausedComponent !== nextProps.drawPausedComponent;
            shouldUpdate = shouldUpdate || this.props.drawZeroDataFlowComponent !== nextProps.drawZeroDataFlowComponent;
            shouldUpdate = shouldUpdate || this.props.drawStaleSnapshot !== nextProps.drawStaleSnapshot;
            shouldUpdate = shouldUpdate || !DAQViewUtility.snapshotElementsEqualShallow(this.props.fedBuilderSummary, nextProps.fedBuilderSummary);
            return shouldUpdate;
        }
        render() {
            let fedBuilderSummary = this.props.fedBuilderSummary;
            let drawPausedComponent = this.props.drawPausedComponent;
            let drawZeroDataFlowComponent = this.props.drawZeroDataFlowComponent;
            let drawStaleSnapshot = this.props.drawStaleSnapshot;
            let fbSummaryRowClass = drawPausedComponent ? "fb-table-fb-summary-row-paused" : "fb-table-fb-summary-row-running";
            let fragmentInRuClass = FormatUtility.getClassNameForNumber(fedBuilderSummary.sumFragmentsInRU != null ? fedBuilderSummary.sumFragmentsInRU : 0, FBTableNumberFormats.FRAGMENTS_IN_RU);
            let eventsInRuClass = FormatUtility.getClassNameForNumber(fedBuilderSummary.sumEventsInRU != null ? fedBuilderSummary.sumEventsInRU : 0, FBTableNumberFormats.EVENTS_IN_RU);
            let requestsClass = FormatUtility.getClassNameForNumber(fedBuilderSummary.sumRequests != null ? fedBuilderSummary.sumRequests : 0, FBTableNumberFormats.REQUESTS);
            if (drawZeroDataFlowComponent) {
                fbSummaryRowClass = "fb-table-fb-summary-row-ratezero";
                if (!drawStaleSnapshot) {
                    let escapeRedField = 'fb-table-ru-red-column-escape';
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
        }
    }
})(DAQView || (DAQView = {}));
