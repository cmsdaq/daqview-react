/**
 * @author Michail Vougioukas
 * @author Philipp Brummer
 */

///<reference path="../../structures/daq-aggregator/daq-snapshot.ts"/>
///<reference path="../daq-snapshot-view/daq-snapshot-view.d.ts"/>

///<reference path="../../utilities/format-util.ts"/>

namespace DAQView {

    import DAQAggregatorSnapshot = DAQAggregator.Snapshot;
    import DAQ = DAQAggregator.Snapshot.DAQ;
    import snapshotElementsEqualShallow = DAQViewUtility.snapshotElementsEqualShallow;
    import FED = DAQAggregator.Snapshot.FED;

    export class FEDBuilderTable implements DAQSnapshotView {
        private DEFAULT_PRESORT_FUNCTION: (snapshot: DAQAggregatorSnapshot) => DAQAggregatorSnapshot = FBTableSortFunctions.TTCP_ASC;

        private INITIAL_SORT_FUNCTION: (snapshot: DAQAggregatorSnapshot) => DAQAggregatorSnapshot = FBTableSortFunctions.TTCP_ASC;
        private INITIAL_PRESORT_FUNCTION: (snapshot: DAQAggregatorSnapshot) => DAQAggregatorSnapshot = FBTableSortFunctions.NONE;

        public htmlRootElement: Element;

        private snapshot: DAQAggregatorSnapshot = null;
        private drawPausedComponent: boolean = false;
        private drawZeroDataFlowComponent: boolean = false;
        private drawStaleSnapshot: boolean = false;

        private previousPauseState: boolean = false;

        private sortFunction: SortFunction = {
            presort: this.INITIAL_PRESORT_FUNCTION,
            sort: this.INITIAL_SORT_FUNCTION
        };

        //columns stored here will get a sort icon
        private currentSorting: {[key: string]: Sorting} = {
            'TTCP': Sorting.Ascending,
            'FB Name': Sorting.None,
            '%W': Sorting.None,
            '%B': Sorting.None,

            'RU': Sorting.None,

            'rate (kHz)': Sorting.None,
            'thru (MB/s)': Sorting.None,
            'size (kB)': Sorting.None,
            '#events': Sorting.None,
            '#frags in RU': Sorting.None,
            '#evts in RU': Sorting.None,
            '#requests': Sorting.None
        };

        constructor(htmlRootElementName: string) {
            this.htmlRootElement = document.getElementById(htmlRootElementName);
        }

        public setSnapshot(snapshot: DAQAggregatorSnapshot, drawPausedComponent: boolean, drawZeroDataFlowComponent:boolean, drawStaleSnapshot:boolean, url:string) {

            if (!snapshot){
                let msg: string = "";
                let errRootElement: any = <ErrorElement message={msg}/>;
                ReactDOM.render(errRootElement, this.htmlRootElement);
            }else {
                if (this.snapshot != null && this.snapshot.getUpdateTimestamp() === snapshot.getUpdateTimestamp()) {
                    console.log("duplicate snapshot detected");
                    if (drawPausedComponent || drawZeroDataFlowComponent || drawStaleSnapshot) {
                        console.log("...but page color has to change, so do render");
                    } else {
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
        public prePassElementSpecificData(args: string []){

        }

        private updateSnapshot() {
            let sortedSnapshot: DAQAggregatorSnapshot = this.sort(this.snapshot);
            let daq: DAQAggregatorSnapshot.DAQ = sortedSnapshot.getDAQ();
            let drawPausedComponent: boolean = this.drawPausedComponent;
            let drawZeroDataFlowComponent: boolean = this.drawZeroDataFlowComponent;
            let drawStaleSnapshot: boolean = this.drawStaleSnapshot;

            let tcdsControllerUrl :string = daq.tcdsGlobalInfo.tcdsControllerContext;
            let tcdsControllerServiceName :string  = daq.tcdsGlobalInfo.tcdsControllerServiceName;

            let fedBuilderTableRootElement: any = <FEDBuilderTableElement tableObject={this}
                                                                          fedBuilders={daq.fedBuilders}
                                                                          fedBuilderSummary={daq.fedBuilderSummary}
                                                                          drawPausedComponent={drawPausedComponent}
                                                                          drawZeroDataFlowComponent={drawZeroDataFlowComponent}
                                                                          tcdsControllerUrl={tcdsControllerUrl}
                                                                          tcdsControllerServiceName={tcdsControllerServiceName}
                                                                          drawStaleSnapshot={drawStaleSnapshot}/>
            ReactDOM.render(fedBuilderTableRootElement, this.htmlRootElement);
        }

        public setSortFunction(sortFunctions: SortFunction) {
            let presortFunction: (snapshot: DAQAggregatorSnapshot) => DAQAggregatorSnapshot;
            let sortFunction: (snapshot: DAQAggregatorSnapshot) => DAQAggregatorSnapshot;

            if (sortFunctions.hasOwnProperty('presort')) {
                presortFunction = sortFunctions.presort;
            } else {
                presortFunction = this.DEFAULT_PRESORT_FUNCTION;
            }
            sortFunction = sortFunctions.sort;

            this.sortFunction = {presort: presortFunction, sort: sortFunction};
            this.updateSnapshot();
        }

        public sort(snapshot: DAQAggregatorSnapshot): DAQAggregatorSnapshot {
            return this.sortFunction.sort(this.sortFunction.presort(snapshot));
        }

        public setCurrentSorting(headerName: string, sorting: Sorting) {
            DAQViewUtility.forEachOwnObjectProperty(this.currentSorting, (header: string) => this.currentSorting[header] = Sorting.None);
            this.currentSorting[headerName] = sorting;
        }

        public getCurrentSorting(headerName: string) {
            return this.currentSorting[headerName];
        }
    }

    interface ErrorElementProperties {
        message: string;
    }

    class ErrorElement extends React.Component<ErrorElementProperties,{}> {
        render() {
            return (
                <div>{this.props.message}</div>
            );
        }
    }

    export namespace FBTableNumberFormats {

        export const RATE: FormatUtility.NumberFormat = {
            baseStyle: 'fb-table-ru-rate',
            formats: [{min: 0, max: 0, styleSuffix: '-zero'}, {styleSuffix: '-nonzero'}]
        };

        export const THROUGHPUT: FormatUtility.NumberFormat = {
            baseStyle: 'fb-table-ru-throughput',
            formats: [{min: 0, max: 0, styleSuffix: '-zero'}, {styleSuffix: '-nonzero'}]
        };

        export const SIZE: FormatUtility.NumberFormat = {
            baseStyle: 'fb-table-ru-size'
        };

        export const EVENTS: FormatUtility.NumberFormat = {
            baseStyle: 'fb-table-ru-events',
            formats: [{min: 0, max: 0, styleSuffix: '-zero'}, {styleSuffix: '-nonzero'}]
        };

        export const FRAGMENTS_IN_RU: FormatUtility.NumberFormat = {
            baseStyle: 'fb-table-ru-fragments-in-ru',
        };

        export const EVENTS_IN_RU: FormatUtility.NumberFormat = {
            baseStyle: 'fb-table-ru-events-in-ru',
        };

        export const REQUESTS: FormatUtility.NumberFormat = {
            baseStyle: 'fb-table-ru-requests',
        };

    }

    export namespace FBTableSortFunctions {
        export function NONE(snapshot: DAQAggregatorSnapshot): DAQAggregatorSnapshot {
            return snapshot;
        }

        export function STATIC(snapshot: DAQAggregatorSnapshot): DAQAggregatorSnapshot {
            snapshot = SubFbPseudoFEDsById(snapshot, false);
            return FrlsByGeoslot(snapshot, false);
        }

        export function FedsById(feds: DAQAggregatorSnapshot.FED[], descending: boolean) {
            feds.sort(function (firstFed: DAQAggregatorSnapshot.FED, secondFed: DAQAggregatorSnapshot.FED) {
                let firstFedId: number = firstFed.srcIdExpected;
                let secondFedId: number = secondFed.srcIdExpected;

                if (firstFedId > secondFedId) {
                    return (descending ? -1 : 1);
                } else if (firstFedId < secondFedId) {
                    return (descending ? 1 : -1);
                } else {
                    return 0;
                }
            });
        }

        function SubFbPseudoFEDsById(snapshot: DAQAggregatorSnapshot, descending: boolean): DAQAggregatorSnapshot {
            let daq: DAQAggregatorSnapshot.DAQ = snapshot.getDAQ();
            let fedBuilders: DAQAggregatorSnapshot.FEDBuilder[] = daq.fedBuilders;

            fedBuilders.forEach(function (fedBuilder: DAQAggregatorSnapshot.FEDBuilder) {
                fedBuilder.subFedbuilders.forEach(function (subFedBuilder: DAQAggregatorSnapshot.SubFEDBuilder) {
                    FedsById(subFedBuilder.feds, descending);
                });
            });

            return snapshot;
        }

        function FrlsByGeoslot(snapshot: DAQAggregatorSnapshot, descending: boolean): DAQAggregatorSnapshot {
            let daq: DAQAggregatorSnapshot.DAQ = snapshot.getDAQ();
            let fedBuilders: DAQAggregatorSnapshot.FEDBuilder[] = daq.fedBuilders;

            // sort the FRLs of each SubFEDBuilder, of each FEDBuilder by their FRL geoslot
            fedBuilders.forEach(function (fedBuilder: DAQAggregatorSnapshot.FEDBuilder) {
                fedBuilder.subFedbuilders.forEach(function (subFEDBuilder: DAQAggregatorSnapshot.SubFEDBuilder) {

                    subFEDBuilder.frls.sort(function (firstFrl: DAQAggregatorSnapshot.FRL, secondFrl: DAQAggregatorSnapshot.FRL) {
                        let firstFrlGeoslot: number = firstFrl.geoSlot;
                        let secondFrlGeoslot: number = secondFrl.geoSlot;

                        if (firstFrlGeoslot > secondFrlGeoslot) {
                            return (descending ? -1 : 1);
                        } else if (firstFrlGeoslot < secondFrlGeoslot) {
                            return (descending ? 1 : -1);
                        } else {
                            return 0;
                        }
                    });

                });
            });

            return snapshot;
        }

        function SubFBByTTCP(snapshot: DAQAggregatorSnapshot, descending: boolean): DAQAggregatorSnapshot {
            let daq: DAQAggregatorSnapshot.DAQ = snapshot.getDAQ();
            let fedBuilders: DAQAggregatorSnapshot.FEDBuilder[] = daq.fedBuilders;

            // sort the SubFEDBuilders of each FEDBuilder by their TTCP name
            fedBuilders.forEach(function (fedBuilder: DAQAggregatorSnapshot.FEDBuilder) {
                fedBuilder.subFedbuilders.sort(function (firstSubFedBuilder: DAQAggregatorSnapshot.SubFEDBuilder, secondSubFedBuilder: DAQAggregatorSnapshot.SubFEDBuilder) {
                    let firstSubFedBuilderTTCPName: string = firstSubFedBuilder.ttcPartition.name;
                    let secondSubFedBuilderTTCPName: string = secondSubFedBuilder.ttcPartition.name;

                    if (firstSubFedBuilderTTCPName > secondSubFedBuilderTTCPName) {
                        return (descending ? -1 : 1);
                    } else if (firstSubFedBuilderTTCPName < secondSubFedBuilderTTCPName) {
                        return (descending ? 1 : -1);
                    } else {
                        return 0;
                    }
                });
            });

            return snapshot;
        }

        function SubFBByPERCBusy(snapshot: DAQAggregatorSnapshot, descending: boolean): DAQAggregatorSnapshot {
            let daq: DAQAggregatorSnapshot.DAQ = snapshot.getDAQ();
            let fedBuilders: DAQAggregatorSnapshot.FEDBuilder[] = daq.fedBuilders;

            // sort the SubFEDBuilders of each FEDBuilder by their TTS percentage busy
            fedBuilders.forEach(function (fedBuilder: DAQAggregatorSnapshot.FEDBuilder) {
                fedBuilder.subFedbuilders.sort(function (firstSubFedBuilder: DAQAggregatorSnapshot.SubFEDBuilder, secondSubFedBuilder: DAQAggregatorSnapshot.SubFEDBuilder) {
                    let firstSubFedBuilderTTSBusy: number = firstSubFedBuilder.ttcPartition.percentBusy;
                    let secondSubFedBuilderTTSBusy: number = secondSubFedBuilder.ttcPartition.percentBusy;

                    if (firstSubFedBuilderTTSBusy > secondSubFedBuilderTTSBusy) {
                        return (descending ? -1 : 1);
                    } else if (firstSubFedBuilderTTSBusy < secondSubFedBuilderTTSBusy) {
                        return (descending ? 1 : -1);
                    } else {
                        return 0;
                    }
                });
            });

            return snapshot;
        }

        function SubFBByPERCWarning(snapshot: DAQAggregatorSnapshot, descending: boolean): DAQAggregatorSnapshot {
            let daq: DAQAggregatorSnapshot.DAQ = snapshot.getDAQ();
            let fedBuilders: DAQAggregatorSnapshot.FEDBuilder[] = daq.fedBuilders;

            // sort the SubFEDBuilders of each FEDBuilder by their TTS percentage warning
            fedBuilders.forEach(function (fedBuilder: DAQAggregatorSnapshot.FEDBuilder) {
                fedBuilder.subFedbuilders.sort(function (firstSubFedBuilder: DAQAggregatorSnapshot.SubFEDBuilder, secondSubFedBuilder: DAQAggregatorSnapshot.SubFEDBuilder) {
                    let firstSubFedBuilderTTSWarning: number = firstSubFedBuilder.ttcPartition.percentWarning;
                    let secondSubFedBuilderTTSWarning: number = secondSubFedBuilder.ttcPartition.percentWarning;

                    if (firstSubFedBuilderTTSWarning > secondSubFedBuilderTTSWarning) {
                        return (descending ? -1 : 1);
                    } else if (firstSubFedBuilderTTSWarning < secondSubFedBuilderTTSWarning) {
                        return (descending ? 1 : -1);
                    } else {
                        return 0;
                    }
                });
            });

            return snapshot;
        }

        function TTCP(snapshot: DAQAggregatorSnapshot, descending: boolean): DAQAggregatorSnapshot {
            snapshot = SubFBByTTCP(snapshot, descending);

            let daq: DAQAggregatorSnapshot.DAQ = snapshot.getDAQ();
            let fedBuilders: DAQAggregatorSnapshot.FEDBuilder[] = daq.fedBuilders;

            // sort the FEDBuilders based on their first SubFEDBuilders TTCP name
            fedBuilders.sort(function (firstFedBuilder: DAQAggregatorSnapshot.FEDBuilder, secondFedBuilder: DAQAggregatorSnapshot.FEDBuilder) {
                if (firstFedBuilder.ru.isEVM) {
                    return -1;
                } else if (secondFedBuilder.ru.isEVM) {
                    return 1;
                }

                let firstFedBuilderFirstTTCPName: string = firstFedBuilder.subFedbuilders[0].ttcPartition.name;
                let secondFedBuilderFirstTTCPName: string = secondFedBuilder.subFedbuilders[0].ttcPartition.name;

                if (firstFedBuilderFirstTTCPName > secondFedBuilderFirstTTCPName) {
                    return (descending ? -1 : 1);
                } else if (firstFedBuilderFirstTTCPName < secondFedBuilderFirstTTCPName) {
                    return (descending ? 1 : -1);
                } else {
                    // if the first TTCP name of both FEDBuilders is the same, sort
                    let firstFedBuilderName: string = firstFedBuilder.name;
                    let secondFedBuilderName: string = secondFedBuilder.name;
                    if (firstFedBuilderName > secondFedBuilderName) {
                        return (descending ? -1 : 1);
                    } else if (firstFedBuilderName < secondFedBuilderName) {
                        return (descending ? 1 : -1);
                    } else {
                        return 0;
                    }
                }
            });

            return snapshot;
        }

        export function TTCP_ASC(snapshot: DAQAggregatorSnapshot): DAQAggregatorSnapshot {
            return TTCP(snapshot, false);
        }

        export function TTCP_DESC(snapshot: DAQAggregatorSnapshot): DAQAggregatorSnapshot {
            return TTCP(snapshot, true);
        }

        function FB(snapshot: DAQAggregatorSnapshot, descending: boolean): DAQAggregatorSnapshot {
            snapshot = SubFBByTTCP(snapshot, descending);

            let daq: DAQAggregatorSnapshot.DAQ = snapshot.getDAQ();
            let fedBuilders: DAQAggregatorSnapshot.FEDBuilder[] = daq.fedBuilders;

            // sort by FEDBuilder name
            fedBuilders.sort(function (firstFedBuilder: DAQAggregatorSnapshot.FEDBuilder, secondFedBuilder: DAQAggregatorSnapshot.FEDBuilder) {
                if (firstFedBuilder.ru.isEVM) {
                    return -1;
                } else if (secondFedBuilder.ru.isEVM) {
                    return 1;
                }


                let firstFedBuilderName: string = firstFedBuilder.name;
                let secondFedBuilderName: string = secondFedBuilder.name;
                if (firstFedBuilderName > secondFedBuilderName) {
                    return (descending ? -1 : 1);
                } else if (firstFedBuilderName < secondFedBuilderName) {
                    return (descending ? 1 : -1);
                } else {
                    return 0;
                }
            });

            return snapshot;
        }

        export function FB_ASC(snapshot: DAQAggregatorSnapshot): DAQAggregatorSnapshot {
            return FB(snapshot, false);
        }

        export function FB_DESC(snapshot: DAQAggregatorSnapshot): DAQAggregatorSnapshot {
            return FB(snapshot, true);
        }


        function PERCBUSY(snapshot: DAQAggregatorSnapshot, descending: boolean): DAQAggregatorSnapshot {
            snapshot = SubFBByPERCBusy(snapshot, true); //returns subFEDBuilders in each FEDBuildder, sorted by decreasing TTS busy percentage

            let daq: DAQAggregatorSnapshot.DAQ = snapshot.getDAQ();
            let fedBuilders: DAQAggregatorSnapshot.FEDBuilder[] = daq.fedBuilders;

            // sort the FEDBuilders based on their top subFEDBuilder's TTCP busy status percentage
            fedBuilders.sort(function (firstFedBuilder: DAQAggregatorSnapshot.FEDBuilder, secondFedBuilder: DAQAggregatorSnapshot.FEDBuilder) {
                if (firstFedBuilder.ru.isEVM) {
                    return -1;
                } else if (secondFedBuilder.ru.isEVM) {
                    return 1;
                }

                let firstFedBuilderFirstTTCPBusy: number = firstFedBuilder.subFedbuilders[0].ttcPartition.percentBusy;
                let secondFedBuilderFirstTTCPBusy: number = secondFedBuilder.subFedbuilders[0].ttcPartition.percentBusy;

                if (firstFedBuilderFirstTTCPBusy > secondFedBuilderFirstTTCPBusy) {
                    return (descending ? -1 : 1);
                } else if (firstFedBuilderFirstTTCPBusy < secondFedBuilderFirstTTCPBusy) {
                    return (descending ? 1 : -1);
                } else {
                    return 0;
                }
            });

            return snapshot;
        }

        export function PERCBUSY_ASC(snapshot: DAQAggregatorSnapshot): DAQAggregatorSnapshot {
            return PERCBUSY(snapshot, false);
        }

        export function PERCBUSY_DESC(snapshot: DAQAggregatorSnapshot): DAQAggregatorSnapshot {
            return PERCBUSY(snapshot, true);
        }


        function PERCWARNING(snapshot: DAQAggregatorSnapshot, descending: boolean): DAQAggregatorSnapshot {
            snapshot = SubFBByPERCWarning(snapshot, true); //returns subFEDBuilders in each FEDBuildder, sorted by decreasing TTS warning percentage

            let daq: DAQAggregatorSnapshot.DAQ = snapshot.getDAQ();
            let fedBuilders: DAQAggregatorSnapshot.FEDBuilder[] = daq.fedBuilders;

            // sort the FEDBuilders based on their top subFEDBuilder's TTCP warning status percentage
            fedBuilders.sort(function (firstFedBuilder: DAQAggregatorSnapshot.FEDBuilder, secondFedBuilder: DAQAggregatorSnapshot.FEDBuilder) {
                if (firstFedBuilder.ru.isEVM) {
                    return -1;
                } else if (secondFedBuilder.ru.isEVM) {
                    return 1;
                }

                let firstFedBuilderFirstTTCPWarning: number = firstFedBuilder.subFedbuilders[0].ttcPartition.percentWarning;
                let secondFedBuilderFirstTTCPWarning: number = secondFedBuilder.subFedbuilders[0].ttcPartition.percentWarning;

                if (firstFedBuilderFirstTTCPWarning > secondFedBuilderFirstTTCPWarning) {
                    return (descending ? -1 : 1);
                } else if (firstFedBuilderFirstTTCPWarning < secondFedBuilderFirstTTCPWarning) {
                    return (descending ? 1 : -1);
                } else {
                    return 0;
                }
            });

            return snapshot;
        }

        export function PERCWARNING_ASC(snapshot: DAQAggregatorSnapshot): DAQAggregatorSnapshot {
            return PERCWARNING(snapshot, false);
        }

        export function PERCWARNING_DESC(snapshot: DAQAggregatorSnapshot): DAQAggregatorSnapshot {
            return PERCWARNING(snapshot, true);
        }


        function RURATE(snapshot: DAQAggregatorSnapshot, descending: boolean): DAQAggregatorSnapshot {

            let daq: DAQAggregatorSnapshot.DAQ = snapshot.getDAQ();
            let fedBuilders: DAQAggregatorSnapshot.FEDBuilder[] = daq.fedBuilders;

            // sort the FEDBuilders based on their RU rate
            fedBuilders.sort(function (firstFedBuilder: DAQAggregatorSnapshot.FEDBuilder, secondFedBuilder: DAQAggregatorSnapshot.FEDBuilder) {
                if (firstFedBuilder.ru.isEVM) {
                    return -1;
                } else if (secondFedBuilder.ru.isEVM) {
                    return 1;
                }

                let firstFedBuilderRURate: number = firstFedBuilder.ru.rate;
                let secondFedBuilderRURate: number = secondFedBuilder.ru.rate;

                if (firstFedBuilderRURate > secondFedBuilderRURate) {
                    return (descending ? -1 : 1);
                } else if (firstFedBuilderRURate < secondFedBuilderRURate) {
                    return (descending ? 1 : -1);
                } else {
                    return 0;
                }
            });

            return snapshot;
        }


        function RUHOSTNAME(snapshot: DAQAggregatorSnapshot, descending: boolean): DAQAggregatorSnapshot {
            let daq: DAQAggregatorSnapshot.DAQ = snapshot.getDAQ();
            let fedBuilders: DAQAggregatorSnapshot.FEDBuilder[] = daq.fedBuilders;

            // sort the FEDBuilders based on their RU throughput
            fedBuilders.sort(function (firstFedBuilder: DAQAggregatorSnapshot.FEDBuilder, secondFedBuilder: DAQAggregatorSnapshot.FEDBuilder) {
                if (firstFedBuilder.ru.isEVM) {
                    return -1;
                } else if (secondFedBuilder.ru.isEVM) {
                    return 1;
                }

                let firstFedBuilderRUHostname: string = firstFedBuilder.ru.hostname;
                let secondFedBuilderRUHostname: string = secondFedBuilder.ru.hostname;

                if (firstFedBuilderRUHostname > secondFedBuilderRUHostname) {
                    return (descending ? -1 : 1);
                } else if (firstFedBuilderRUHostname < secondFedBuilderRUHostname) {
                    return (descending ? 1 : -1);
                } else {
                    return 0;
                }
            });

            return snapshot;
        }

        export function RU_HOSTNAME_ASC(snapshot: DAQAggregatorSnapshot) {
            return RUHOSTNAME(snapshot, false);
        }

        export function RU_HOSTNAME_DESC(snapshot: DAQAggregatorSnapshot) {
            return RUHOSTNAME(snapshot, true);
        }

        export function RURATE_ASC(snapshot: DAQAggregatorSnapshot): DAQAggregatorSnapshot {
            return RURATE(snapshot, false);
        }

        export function RURATE_DESC(snapshot: DAQAggregatorSnapshot): DAQAggregatorSnapshot {
            return RURATE(snapshot, true);
        }

        function RUTHROUGHPUT(snapshot: DAQAggregatorSnapshot, descending: boolean): DAQAggregatorSnapshot {

            let daq: DAQAggregatorSnapshot.DAQ = snapshot.getDAQ();
            let fedBuilders: DAQAggregatorSnapshot.FEDBuilder[] = daq.fedBuilders;

            // sort the FEDBuilders based on their RU throughput
            fedBuilders.sort(function (firstFedBuilder: DAQAggregatorSnapshot.FEDBuilder, secondFedBuilder: DAQAggregatorSnapshot.FEDBuilder) {
                if (firstFedBuilder.ru.isEVM) {
                    return -1;
                } else if (secondFedBuilder.ru.isEVM) {
                    return 1;
                }

                let firstFedBuilderRUThroughput: number = firstFedBuilder.ru.throughput;
                let secondFedBuilderRUThroughput: number = secondFedBuilder.ru.throughput;

                if (firstFedBuilderRUThroughput > secondFedBuilderRUThroughput) {
                    return (descending ? -1 : 1);
                } else if (firstFedBuilderRUThroughput < secondFedBuilderRUThroughput) {
                    return (descending ? 1 : -1);
                } else {
                    return 0;
                }
            });

            return snapshot;
        }

        export function RUTHROUGHPUT_ASC(snapshot: DAQAggregatorSnapshot): DAQAggregatorSnapshot {
            return RUTHROUGHPUT(snapshot, false);
        }

        export function RUTHROUGHPUT_DESC(snapshot: DAQAggregatorSnapshot): DAQAggregatorSnapshot {
            return RUTHROUGHPUT(snapshot, true);
        }

        function RUSIZE(snapshot: DAQAggregatorSnapshot, descending: boolean): DAQAggregatorSnapshot {

            let daq: DAQAggregatorSnapshot.DAQ = snapshot.getDAQ();
            let fedBuilders: DAQAggregatorSnapshot.FEDBuilder[] = daq.fedBuilders;

            // sort the FEDBuilders based on their RU size
            fedBuilders.sort(function (firstFedBuilder: DAQAggregatorSnapshot.FEDBuilder, secondFedBuilder: DAQAggregatorSnapshot.FEDBuilder) {
                if (firstFedBuilder.ru.isEVM) {
                    return -1;
                } else if (secondFedBuilder.ru.isEVM) {
                    return 1;
                }

                let firstFedBuilderRUSize: number = firstFedBuilder.ru.superFragmentSizeMean;
                let secondFedBuilderRUSize: number = secondFedBuilder.ru.superFragmentSizeMean;

                if (firstFedBuilderRUSize > secondFedBuilderRUSize) {
                    return (descending ? -1 : 1);
                } else if (firstFedBuilderRUSize < secondFedBuilderRUSize) {
                    return (descending ? 1 : -1);
                } else {
                    return 0;
                }
            });

            return snapshot;
        }

        export function RUSIZE_ASC(snapshot: DAQAggregatorSnapshot): DAQAggregatorSnapshot {
            return RUSIZE(snapshot, false);
        }

        export function RUSIZE_DESC(snapshot: DAQAggregatorSnapshot): DAQAggregatorSnapshot {
            return RUSIZE(snapshot, true);
        }

        function RUNUMFRAG(snapshot: DAQAggregatorSnapshot, descending: boolean): DAQAggregatorSnapshot {

            let daq: DAQAggregatorSnapshot.DAQ = snapshot.getDAQ();
            let fedBuilders: DAQAggregatorSnapshot.FEDBuilder[] = daq.fedBuilders;

            // sort the FEDBuilders based on their RU number of fragments in RU
            fedBuilders.sort(function (firstFedBuilder: DAQAggregatorSnapshot.FEDBuilder, secondFedBuilder: DAQAggregatorSnapshot.FEDBuilder) {
                if (firstFedBuilder.ru.isEVM) {
                    return -1;
                } else if (secondFedBuilder.ru.isEVM) {
                    return 1;
                }

                let firstFedBuilderRUNumfrag: number = firstFedBuilder.ru.fragmentsInRU;
                let secondFedBuilderRUNumfrag: number = secondFedBuilder.ru.fragmentsInRU;

                if (firstFedBuilderRUNumfrag > secondFedBuilderRUNumfrag) {
                    return (descending ? -1 : 1);
                } else if (firstFedBuilderRUNumfrag < secondFedBuilderRUNumfrag) {
                    return (descending ? 1 : -1);
                } else {
                    return 0;
                }
            });

            return snapshot;
        }

        export function RUNUMFRAG_ASC(snapshot: DAQAggregatorSnapshot): DAQAggregatorSnapshot {
            return RUNUMFRAG(snapshot, false);
        }

        export function RUNUMFRAG_DESC(snapshot: DAQAggregatorSnapshot): DAQAggregatorSnapshot {
            return RUNUMFRAG(snapshot, true);
        }

        function RUNUMEVTSINRU(snapshot: DAQAggregatorSnapshot, descending: boolean): DAQAggregatorSnapshot {

            let daq: DAQAggregatorSnapshot.DAQ = snapshot.getDAQ();
            let fedBuilders: DAQAggregatorSnapshot.FEDBuilder[] = daq.fedBuilders;

            // sort the FEDBuilders based on their RU number of events in RU
            fedBuilders.sort(function (firstFedBuilder: DAQAggregatorSnapshot.FEDBuilder, secondFedBuilder: DAQAggregatorSnapshot.FEDBuilder) {
                if (firstFedBuilder.ru.isEVM) {
                    return -1;
                } else if (secondFedBuilder.ru.isEVM) {
                    return 1;
                }

                let firstFedBuilderRUNumevts: number = firstFedBuilder.ru.eventsInRU;
                let secondFedBuilderRUNumevts: number = secondFedBuilder.ru.eventsInRU;

                if (firstFedBuilderRUNumevts > secondFedBuilderRUNumevts) {
                    return (descending ? -1 : 1);
                } else if (firstFedBuilderRUNumevts < secondFedBuilderRUNumevts) {
                    return (descending ? 1 : -1);
                } else {
                    return 0;
                }
            });

            return snapshot;
        }

        export function RUNUMEVTSINRU_ASC(snapshot: DAQAggregatorSnapshot): DAQAggregatorSnapshot {
            return RUNUMEVTSINRU(snapshot, false);
        }

        export function RUNUMEVTSINRU_DESC(snapshot: DAQAggregatorSnapshot): DAQAggregatorSnapshot {
            return RUNUMEVTSINRU(snapshot, true);
        }

        function RUNUMEVTS(snapshot: DAQAggregatorSnapshot, descending: boolean): DAQAggregatorSnapshot {

            let daq: DAQAggregatorSnapshot.DAQ = snapshot.getDAQ();
            let fedBuilders: DAQAggregatorSnapshot.FEDBuilder[] = daq.fedBuilders;

            // sort the FEDBuilders based on their RU number of events in RU
            fedBuilders.sort(function (firstFedBuilder: DAQAggregatorSnapshot.FEDBuilder, secondFedBuilder: DAQAggregatorSnapshot.FEDBuilder) {
                if (firstFedBuilder.ru.isEVM) {
                    return -1;
                } else if (secondFedBuilder.ru.isEVM) {
                    return 1;
                }

                let firstFedBuilderRUNumevts: number = firstFedBuilder.ru.eventCount;
                let secondFedBuilderRUNumevts: number = secondFedBuilder.ru.eventCount;

                if (firstFedBuilderRUNumevts > secondFedBuilderRUNumevts) {
                    return (descending ? -1 : 1);
                } else if (firstFedBuilderRUNumevts < secondFedBuilderRUNumevts) {
                    return (descending ? 1 : -1);
                } else {
                    return 0;
                }
            });

            return snapshot;
        }

        export function RUNUMEVTS_ASC(snapshot: DAQAggregatorSnapshot): DAQAggregatorSnapshot {
            return RUNUMEVTS(snapshot, false);
        }

        export function RUNUMEVTS_DESC(snapshot: DAQAggregatorSnapshot): DAQAggregatorSnapshot {
            return RUNUMEVTS(snapshot, true);
        }

        function RUREQUESTS(snapshot: DAQAggregatorSnapshot, descending: boolean): DAQAggregatorSnapshot {

            let daq: DAQAggregatorSnapshot.DAQ = snapshot.getDAQ();
            let fedBuilders: DAQAggregatorSnapshot.FEDBuilder[] = daq.fedBuilders;

            // sort the FEDBuilders based on their RU number of requests
            fedBuilders.sort(function (firstFedBuilder: DAQAggregatorSnapshot.FEDBuilder, secondFedBuilder: DAQAggregatorSnapshot.FEDBuilder) {
                if (firstFedBuilder.ru.isEVM) {
                    return -1;
                } else if (secondFedBuilder.ru.isEVM) {
                    return 1;
                }

                let firstFedBuilderRURequests: number = firstFedBuilder.ru.requests;
                let secondFedBuilderRURequests: number = secondFedBuilder.ru.requests;

                if (firstFedBuilderRURequests > secondFedBuilderRURequests) {
                    return (descending ? -1 : 1);
                } else if (firstFedBuilderRURequests < secondFedBuilderRURequests) {
                    return (descending ? 1 : -1);
                } else {
                    return 0;
                }
            });

            return snapshot;
        }

        export function RUREQUESTS_ASC(snapshot: DAQAggregatorSnapshot): DAQAggregatorSnapshot {
            return RUREQUESTS(snapshot, false);
        }

        export function RUREQUESTS_DESC(snapshot: DAQAggregatorSnapshot): DAQAggregatorSnapshot {
            return RUREQUESTS(snapshot, true);
        }


    }

    //assignment of sort function to the columns (where applicable)
    const FB_TABLE_BASE_HEADERS: FEDBuilderTableHeaderProperties[] = [
        {content: 'P'},
        {content: 'A'},
        {content: 'F'},
        {
            content: '%W',
            sortFunctions: {
                Ascending: {sort: FBTableSortFunctions.PERCWARNING_ASC},
                Descending: {sort: FBTableSortFunctions.PERCWARNING_DESC}
            }
        },
        {
            content: '%B',
            sortFunctions: {
                Ascending: {sort: FBTableSortFunctions.PERCBUSY_ASC},
                Descending: {sort: FBTableSortFunctions.PERCBUSY_DESC}
            }
        },
        {content: 'frlpc'},
        {content: ''},
        {content: 'geoSlot:SrcId      /      TTSOnlyFEDSrcId'},
        {content: 'min Trg'},
        {content: 'max Trg'},
        {
            content: 'FB Name',
            sortFunctions: {
                Ascending: {sort: FBTableSortFunctions.FB_ASC},
                Descending: {sort: FBTableSortFunctions.FB_DESC}
            }
        },
        {
            content: 'RU',
            sortFunctions: {
                Ascending: {sort: FBTableSortFunctions.RU_HOSTNAME_ASC},
                Descending: {sort: FBTableSortFunctions.RU_HOSTNAME_DESC}
            }
        },
        {content: '         '},
        {content: 'warn'},
        {
            content: 'rate (kHz)',
            sortFunctions: {
                Ascending: {sort: FBTableSortFunctions.RURATE_ASC},
                Descending: {sort: FBTableSortFunctions.RURATE_DESC}
            }
        },
        {
            content: 'thru (MB/s)',
            sortFunctions: {
                Ascending: {sort: FBTableSortFunctions.RUTHROUGHPUT_ASC},
                Descending: {sort: FBTableSortFunctions.RUTHROUGHPUT_DESC}
            }
        },
        {
            content: 'size (kB)',
            sortFunctions: {
                Ascending: {sort: FBTableSortFunctions.RUSIZE_ASC},
                Descending: {sort: FBTableSortFunctions.RUSIZE_DESC}
            }
        },
        {
            content: '#events',
            sortFunctions: {
                Ascending: {sort: FBTableSortFunctions.RUNUMEVTS_ASC},
                Descending: {sort: FBTableSortFunctions.RUNUMEVTS_DESC}
            }
        },
        {
            content: '#frags in RU',
            sortFunctions: {
                Ascending: {sort: FBTableSortFunctions.RUNUMFRAG_ASC},
                Descending: {sort: FBTableSortFunctions.RUNUMFRAG_DESC}
            }
        },
        {
            content: '#evts in RU',
            sortFunctions: {
                Ascending: {sort: FBTableSortFunctions.RUNUMEVTSINRU_ASC},
                Descending: {sort: FBTableSortFunctions.RUNUMEVTSINRU_DESC}
            }
        },
        {
            content: '#requests',
            sortFunctions: {
                Ascending: {sort: FBTableSortFunctions.RUREQUESTS_ASC},
                Descending: {sort: FBTableSortFunctions.RUREQUESTS_DESC}
            }
        }
    ];

    const FB_TABLE_TOP_HEADERS: FEDBuilderTableHeaderProperties[] = FB_TABLE_BASE_HEADERS.slice();
    FB_TABLE_TOP_HEADERS.unshift({
        content: 'TTCP',
        sortFunctions: {
            Ascending: {presort: FBTableSortFunctions.NONE, sort: FBTableSortFunctions.TTCP_ASC},
            Descending: {presort: FBTableSortFunctions.NONE, sort: FBTableSortFunctions.TTCP_DESC}
        }
    });

    const FB_TABLE_SUMMARY_HEADERS: FEDBuilderTableHeaderProperties[] = FB_TABLE_BASE_HEADERS.slice();
    FB_TABLE_SUMMARY_HEADERS.unshift({content: 'Summary'});

    interface FEDBuilderTableElementProperties {
        tableObject: FEDBuilderTable;
        fedBuilders: DAQAggregatorSnapshot.FEDBuilder[];
        fedBuilderSummary: DAQAggregatorSnapshot.FEDBuilderSummary;
        drawPausedComponent: boolean;
        drawZeroDataFlowComponent: boolean;
        tcdsControllerUrl: string;
        tcdsControllerServiceName: string;
        drawStaleSnapshot: boolean;
    }

    class FEDBuilderTableElement extends React.Component<FEDBuilderTableElementProperties,{}> {
        render() {
            let fedBuilders: DAQAggregatorSnapshot.FEDBuilder[] = this.props.fedBuilders;

            let drawPausedComponents: boolean = this.props.drawPausedComponent;
            let drawZeroDataFlowComponents: boolean = this.props.drawZeroDataFlowComponent;
            let drawStaleSnapshot = this.props.drawStaleSnapshot;

            let tcdsControllerUrl: string = this.props.tcdsControllerUrl;
            let tcdsControllerServiceName: string = this.props.tcdsControllerServiceName;

            let evmMaxTrg: number = null;
            //can similarly invent and pass down the evm minTrg here, for comparison at innermost levels
            fedBuilders.forEach(function (fedBuilder) {
                if (fedBuilder.ru != null && fedBuilder.ru.isEVM) {
                    if (fedBuilder.subFedbuilders != null && fedBuilder.subFedbuilders.length > 0) {
                        evmMaxTrg = fedBuilder.subFedbuilders[0].maxTrig;
                    }
                }
            });

            let fedBuilderRows: any[] = [];
            fedBuilders.forEach(function (fedBuilder) {
                let index: number = fedBuilderRows.length;
                let oddRow: boolean = (index % 2 == 1)? true : false;

                fedBuilderRows.push(<FEDBuilderRow key={fedBuilder['@id']} fedBuilder={fedBuilder}
                                                   evmMaxTrg={evmMaxTrg}
                                                   drawPausedComponent={drawPausedComponents}
                                                   drawZeroDataFlowComponent={drawZeroDataFlowComponents}
                                                   tcdsControllerUrl={tcdsControllerUrl}
                                                   tcdsControllerServiceName={tcdsControllerServiceName}
                                                   oddRow={oddRow}
                                                   drawStaleSnapshot={drawStaleSnapshot}/>);
            });

            let fedBuilderSummary: DAQAggregatorSnapshot.FEDBuilderSummary = this.props.fedBuilderSummary;
            let numRus: number = fedBuilders.length;
            let numUsedRus: number = numRus - fedBuilderSummary.rusMasked;



            let tableObject: FEDBuilderTable = this.props.tableObject;

            return (
                <table className="fb-table">
                    <colgroup className="fb-table-colgroup-fedbuilder" span="12"/>
                    <colgroup className="fb-table-colgroup-evb" span="10"/>
                    <thead className="fb-table-head">
                    <FEDBuilderTableTopHeaderRow key="fb-top-header-row" drawPausedComponent={drawPausedComponents}/>
                    <FEDBuilderTableSecondaryHeaderRow key="fb-secondary-header-row" drawPausedComponent={drawPausedComponents}/>
                    <FEDBuilderTableHeaderRow key="fb-header-row" tableObject={tableObject}
                                              headers={FB_TABLE_TOP_HEADERS} drawPausedComponent={drawPausedComponents}/>
                    </thead>
                    {fedBuilderRows}
                    <tfoot className="fb-table-foot">
                    <FEDBuilderTableHeaderRow key="fb-summary-header-row" tableObject={tableObject}
                                              headers={FB_TABLE_SUMMARY_HEADERS} drawPausedComponent={drawPausedComponents}/>
                    <FEDBuilderTableSummaryRow key="fb-summary-row" fedBuilderSummary={fedBuilderSummary}
                                               numRus={numRus} numUsedRus={numUsedRus} drawPausedComponent={drawPausedComponents} drawZeroDataFlowComponent={drawZeroDataFlowComponents}
                                               drawStaleSnapshot={drawStaleSnapshot}/>
                    </tfoot>
                </table>
            );
        }
    }

    interface FEDBuilderRowProperties {
        fedBuilder: DAQAggregatorSnapshot.FEDBuilder;
        evmMaxTrg: number;
        additionalClasses?: string | string[];
        drawPausedComponent: boolean;
        drawZeroDataFlowComponent: boolean;
        tcdsControllerUrl: string;
        tcdsControllerServiceName: string;
        oddRow: boolean;
        drawStaleSnapshot: boolean;
    }

    interface RUWarningDataProperties {
        ru: DAQAggregatorSnapshot.RU;
    }

    class RUWarningData extends React.Component<RUWarningDataProperties,{}> {
        render() {
            let warnMsg: string = '';

            let ruWarningData: any[] = [];

            let ru: DAQAggregatorSnapshot.RU = this.props.ru;


            if (ru.stateName != 'Halted' && ru.stateName != 'Ready' && ru.stateName != 'Enabled'){
                warnMsg += ru.stateName + ' ';
            }

            let fedsWithErrors: FED[] = ru.fedsWithErrors;


            let fedWithErrors: FED;

            //without fragments
            for (var idx=0;idx<fedsWithErrors.length;idx++){
                fedWithErrors = fedsWithErrors[idx];
                if (fedWithErrors.ruFedWithoutFragments && ru.rate == 0 && ru.incompleteSuperFragmentCount > 0){
                    ruWarningData.push(<span className="fb-table-ru-warn-message"> {fedWithErrors.srcIdExpected + ' '} </span>);
                }
            }

            //error counters
            for (var idx=0;idx<fedsWithErrors.length;idx++){
                fedWithErrors = fedsWithErrors[idx];
                let errorString: String = '';

                if (fedWithErrors.ruFedDataCorruption > 0){
                    errorString += '#bad=' + fedWithErrors.ruFedDataCorruption + ',';
                }
                if (fedWithErrors.ruFedOutOfSync > 0){
                    errorString += '#OOS=' +fedWithErrors.ruFedOutOfSync + ',';
                }
                if (fedWithErrors.ruFedBXError > 0){
                    errorString += '#BX=' +fedWithErrors.ruFedBXError + ',';
                }
                if (fedWithErrors.ruFedCRCError > 0){
                    errorString += '#CRC=' +fedWithErrors.ruFedCRCError + ',';
                }

                if (errorString!='') {
                    ruWarningData.push(<span className="fb-table-ru-warn-message"> { fedWithErrors.srcIdExpected + ':' + errorString} </span>);
                }
            }

            return (
                <td>{ruWarningData}</td>
            );
        }
    }

    class FEDBuilderRow extends React.Component<FEDBuilderRowProperties,{}> {
        render() {

            let drawPausedComponent = this.props.drawPausedComponent;
            let drawZeroDataFlowComponent = this.props.drawZeroDataFlowComponent;
            let drawStaleSnapshot = this.props.drawStaleSnapshot;

            let oddRow: boolean = this.props.oddRow;

            let fedBuilder: DAQAggregatorSnapshot.FEDBuilder = this.props.fedBuilder;

            let subFedBuilders: DAQAggregatorSnapshot.SubFEDBuilder[] = fedBuilder.subFedbuilders;
            let numSubFedBuilders: number = subFedBuilders.length;

            let ru: DAQAggregatorSnapshot.RU = fedBuilder.ru;

            let ruMasked: boolean = ru.masked;
            let ruHostname: string = ru.hostname;
            let ruPort: number = ru.port;
            let ruName: string = ruHostname.split(".")[0];
            ruName = ruName.indexOf('ru')==0 ? ruName.substring(3) : ruName;
            let ruUrl: string = 'http://' + ruHostname + ':'+ruPort+'/urn:xdaq-application:service=' + (ru.isEVM ? 'evm' : 'ru');

            let ruState: string  = '';
            let ruStateClass = 'fb-table-ru-state-normal';

            if (ru.stateName){

                ruState = ru.stateName;

                if (ruState === 'Halted' || ruState === 'Ready' || ruState === 'Enabled' || ruState === 'unknown' || ruState === ''){
                    ruState = '';
                }else{
                    ruStateClass = 'fb-table-ru-state-warn';
                }

                if (ruState === 'Failed' || ruState === 'Error'){
                    ruStateClass = 'fb-table-ru-state-error';
                }
            }

            let ruJobCrashStateDisplay: string = "";
            let ruJobCrashStateDisplayClass: string = "";
            if (ru.crashed){
                ruJobCrashStateDisplay = "JobCrash";
                ruJobCrashStateDisplayClass = "fb-table-jobcrash";
            }

            let fbRowZeroEvmRateClass: string = "";
            if (drawZeroDataFlowComponent && fedBuilder.ru.isEVM){
                fbRowZeroEvmRateClass = "fb-table-fb-evm-row-ratezero";
            }

            let fbRowRateClass: string = classNames(fbRowZeroEvmRateClass, FormatUtility.getClassNameForNumber(ru.rate, FBTableNumberFormats.RATE));

            let fedBuilderData: any[] = [];
            fedBuilderData.push(<td rowSpan={numSubFedBuilders}>{fedBuilder.name}</td>);
            fedBuilderData.push(<td rowSpan={numSubFedBuilders}><a href={ruUrl} target="_blank">{ruName}</a>
            </td>);
            fedBuilderData.push(<td rowSpan={numSubFedBuilders}>
                <div className={ruStateClass}>{ruState}</div>
                <div className={ruJobCrashStateDisplayClass}>{ruJobCrashStateDisplay}</div>
            </td>);
            fedBuilderData.push(<td rowSpan={numSubFedBuilders}><RUWarningData key={ru['@id']} ru={ru}/></td>);
            fedBuilderData.push(<td rowSpan={numSubFedBuilders}
                                    className={fbRowRateClass}>{(ru.rate / 1000).toFixed(3)}</td>);
            fedBuilderData.push(<td rowSpan={numSubFedBuilders}
                                    className={FormatUtility.getClassNameForNumber(ru.throughput, FBTableNumberFormats.THROUGHPUT)}>{(ru.throughput / 1000 / 1000).toFixed(1)}</td>);

            let sizeClass: string;
            let eventCountClass: string;
            let fragmentInRuClass: string;
            let eventsInRuClass: string;
            let requestsClass: string;

            if (ruMasked && ru.eventCount == 0) {
                sizeClass = eventCountClass = fragmentInRuClass = eventsInRuClass = requestsClass = 'fb-table-ru-masked';
            } else {
                sizeClass = FormatUtility.getClassNameForNumber(ru.superFragmentSizeMean, FBTableNumberFormats.SIZE);
                eventCountClass = FormatUtility.getClassNameForNumber(ru.eventCount, FBTableNumberFormats.EVENTS);
                fragmentInRuClass = FormatUtility.getClassNameForNumber(ru.fragmentsInRU, FBTableNumberFormats.FRAGMENTS_IN_RU);
                eventsInRuClass = FormatUtility.getClassNameForNumber(ru.eventsInRU, FBTableNumberFormats.EVENTS_IN_RU);
                requestsClass = FormatUtility.getClassNameForNumber(ru.requests, FBTableNumberFormats.REQUESTS);
            }

            //invert color when DAQ is stuck, because red colors are missed
            if (drawZeroDataFlowComponent && oddRow) {

                let escapeRedField: string = 'fb-table-ru-red-column-escape';

                if (fragmentInRuClass === 'fb-table-ru-fragments-in-ru'){
                    fragmentInRuClass = escapeRedField;
                }
                if (eventsInRuClass === 'fb-table-ru-events-in-ru'){
                    eventsInRuClass = escapeRedField;
                }
                if (requestsClass === 'fb-table-ru-requests'){
                    requestsClass = escapeRedField;
                }
            }

            let superFragmentSizePrecision: number = (ru.superFragmentSizeMean > 1000) ? 1 : 3;


            fedBuilderData.push(<td rowSpan={numSubFedBuilders}
                                    className={sizeClass}>{(ru.superFragmentSizeMean / 1000).toFixed(superFragmentSizePrecision)}±{(ru.superFragmentSizeStddev / 1000).toFixed(superFragmentSizePrecision)}</td>);
            fedBuilderData.push(<td rowSpan={numSubFedBuilders}
                                    className={eventCountClass}>{ru.eventCount}</td>);
            fedBuilderData.push(<td rowSpan={numSubFedBuilders}
                                    className={fragmentInRuClass}>{ru.fragmentsInRU}</td>);
            fedBuilderData.push(<td rowSpan={numSubFedBuilders}
                                    className={eventsInRuClass}>{ru.eventsInRU}</td>);
            fedBuilderData.push(<td rowSpan={numSubFedBuilders}
                                    className={requestsClass}>{ru.requests}</td>);

            let fbRowClass: string = drawPausedComponent? "fb-table-fb-row-paused" : "fb-table-fb-row-running";


            if (drawZeroDataFlowComponent){
                fbRowClass = "fb-table-fb-row-ratezero";
            }

            if (drawStaleSnapshot && (!drawPausedComponent)){
                fbRowClass = 'fb-table-fb-row-stale-page-row';
            }

            let fbRowClassName: string = classNames(fbRowClass, this.props.additionalClasses);

            let children: any = [];
            let count: number = 0;
            subFedBuilders.forEach(subFedBuilder => children.push(<SubFEDBuilderRow evmMaxTrg={this.props.evmMaxTrg}
                                                                                    subFedBuilder={subFedBuilder}
                                                                                    additionalContent={++count == 1 ? fedBuilderData : null}
                                                                                    tcdsControllerUrl={this.props.tcdsControllerUrl}
                                                                                    tcdsControllerServiceName={this.props.tcdsControllerServiceName}
                                                                                    drawZeroDataFlowComponent={drawZeroDataFlowComponent}/>));
            return (
                <tbody className={fbRowClassName}>
                {children}
                </tbody>
            );
        }
    }

    interface FEDBuilderTableTopHeaderRowProperties {
        drawPausedComponent: boolean;
    }


    class FEDBuilderTableTopHeaderRow extends React.Component<FEDBuilderTableTopHeaderRowProperties,{}> {
        shouldComponentUpdate() {

            return false;
        }

        render() {
            let drawPausedComponent: boolean = this.props.drawPausedComponent;
            return (
                <tr className="fb-table-top-header-row">
                    <FEDBuilderTableHeader additionalClasses="fb-table-help" content={<a href="fbtablehelp.html" target="_blank">Table Help</a>}
                                           colSpan="1" drawPausedComponent={drawPausedComponent}/>
                    <FEDBuilderTableHeader content="F  E  D  B  U  I  L  D  E  R" colSpan="11" drawPausedComponent={drawPausedComponent}/>
                    <FEDBuilderTableHeader content="E  V  B" colSpan="10" drawPausedComponent={drawPausedComponent}/>
                </tr>

            );
        }
    }

    interface FEDBuilderTableSecondaryHeaderRowProperties {
        drawPausedComponent: boolean;
    }

    class FEDBuilderTableSecondaryHeaderRow extends React.Component<FEDBuilderTableSecondaryHeaderRowProperties,{}> {
        shouldComponentUpdate() {

            return false;
        }

        render() {
            let drawPausedComponent: boolean = this.props.drawPausedComponent;
            return (
                <tr className="fb-table-secondary-header-row">
                    <FEDBuilderTableHeader content="" colSpan="1" drawPausedComponent={drawPausedComponent}/>
                    <FEDBuilderTableHeader content="T T S" colSpan="3" drawPausedComponent={drawPausedComponent}/>
                    <FEDBuilderTableHeader content="" colSpan="18" drawPausedComponent={drawPausedComponent}/>
                </tr>

            );
        }
    }

    interface FEDBuilderTableHeaderRowProperties {
        headers: FEDBuilderTableHeaderProperties[];
        tableObject: FEDBuilderTable;
        drawPausedComponent: boolean;
    }

    class FEDBuilderTableHeaderRow extends React.Component<FEDBuilderTableHeaderRowProperties,{}> {
        render() {
            let drawPausedComponent: boolean = this.props.drawPausedComponent;
            let tableObject: FEDBuilderTable = this.props.tableObject;

            let children: any[] = [];
            this.props.headers.forEach(header => children.push(<FEDBuilderTableHeader
                key={header.content}
                content={header.content}
                colSpan={header.colSpan}
                additionalClasses={header.additionalClasses}
                tableObject={tableObject}
                sorting={tableObject.getCurrentSorting(header.content)}
                sortFunctions={header.sortFunctions}
                drawPausedComponent={drawPausedComponent}/>));
            return (
                <tr className="fb-table-header-row">
                    {children}
                </tr>
            );
        }
    }

    interface FEDBuilderTableHeaderProperties {
        content: any;
        colSpan?: string;
        additionalClasses?: string | string[];
        tableObject?: FEDBuilderTable;
        sorting?: Sorting;
        sortFunctions?: { [key: string]: SortFunction };
        drawPausedComponent?: boolean;
    }

    class FEDBuilderTableHeader extends React.Component<FEDBuilderTableHeaderProperties,{}> {
        shouldComponentUpdate(nextProps: FEDBuilderTableHeaderProperties) {
            return this.props.sorting !== nextProps.sorting;
        }

        render() {
            let drawPausedComponent: boolean = this.props.drawPausedComponent;

            let content: string = this.props.content;
            let colSpan: string = this.props.colSpan;
            let additionalClasses: string | string[] = this.props.additionalClasses;
            let fbHeaderClass: string = "fb-table-header";
            let className: string = classNames(fbHeaderClass, additionalClasses);

            let tableObject: FEDBuilderTable = this.props.tableObject;
            let currentSorting: Sorting = this.props.sorting ? this.props.sorting : null;
            let sortFunctions: { [key: string]: SortFunction } = this.props.sortFunctions;

            let isSortable: boolean = (tableObject != null && sortFunctions != null);

            let clickFunction: () => void = null;
            if (isSortable) {
                if (currentSorting === Sorting.None || currentSorting === Sorting.Descending) {
                    clickFunction = function () {
                        tableObject.setSortFunction.bind(tableObject)(sortFunctions[Sorting.Ascending.toString()]);
                        tableObject.setCurrentSorting.bind(tableObject)(content, Sorting.Ascending);
                    };
                } else if (currentSorting === Sorting.Ascending) {
                    clickFunction = function () {
                        tableObject.setSortFunction.bind(tableObject)(sortFunctions[Sorting.Descending.toString()]);
                        tableObject.setCurrentSorting.bind(tableObject)(content, Sorting.Descending);
                    };
                }
            }


            //handlers to be used with onMouseOver and onMouseOut of this element
            /*
             let mouseOverFunction: () => void = null;
             mouseOverFunction = function (){

             };

             let mouseOutFunction: () => void = null;
             mouseOutFunction = function (){

             //alert("mouseOut"+content);
             };*/


            let sortingImage: any = null;
            if (currentSorting != null) {
                sortingImage = <input type="image" className="fb-table-sort-image"
                                      src={'dist/img/' + currentSorting.getImagePath()}
                                      alt={currentSorting.toString()}
                                      title="Sort" onClick={clickFunction}/>;
            }

            return (
                <th className={className} colSpan={colSpan ? colSpan : "1"}>
                    {content}{sortingImage}
                </th>
            );
        }
    }

    interface RUMessagesProperties {
        rowSpan?: number;
        infoMessage: string;
        warnMessage: string;
        errorMessage: string;
    }

    class RUMessages extends React.Component<RUMessagesProperties,{}> {
        shouldComponentUpdate(nextProps: RUMessagesProperties) {
            let shouldUpdate: boolean = false;
            shouldUpdate = shouldUpdate || this.props.rowSpan === nextProps.rowSpan;
            shouldUpdate = shouldUpdate || this.props.infoMessage === nextProps.infoMessage;
            shouldUpdate = shouldUpdate || this.props.warnMessage === nextProps.warnMessage;
            shouldUpdate = shouldUpdate || this.props.errorMessage === nextProps.errorMessage;

            return shouldUpdate;
        }

        render() {
            return (
                <td className="fb-table-ru-messages" rowSpan={this.props.rowSpan ? this.props.rowSpan : 1}>
                    <span className="fb-table-ru-error-message">{this.props.errorMessage}</span>
                    <span className="fb-table-ru-warn-message">{this.props.warnMessage}</span>
                    <span className="fb-table-ru-info-message">{this.props.infoMessage}</span>
                </td>
            );
        }
    }

    interface SubFEDBuilderRowProperties {
        subFedBuilder: DAQAggregatorSnapshot.SubFEDBuilder;
        evmMaxTrg?: number;
        additionalContent?: any[];
        additionalClasses?: string | string[];
        tcdsControllerUrl: string;
        tcdsControllerServiceName: string;
        drawZeroDataFlowComponent: boolean;
    }

    class SubFEDBuilderRow extends React.Component<SubFEDBuilderRowProperties,{}> {
        render() {

            let drawZeroDataFlowComponent = this.props.drawZeroDataFlowComponent;

            let subFedBuilder: DAQAggregatorSnapshot.SubFEDBuilder = this.props.subFedBuilder;
            let frlPc: DAQAggregatorSnapshot.FRLPc = subFedBuilder.frlPc;
            let frlPcHostname: string = frlPc.hostname;
            let frlPcPort: number = frlPc.port;
            let frlPcName: string = frlPcHostname.split(".")[0];

            frlPcName = frlPcName.indexOf('frlpc')==0 && frlPcName.indexOf('frlpc40')==-1? frlPcName.substring(6) : frlPcName;
            let frlPcUrl: string = 'http://' + frlPcHostname + ':'+frlPcPort;
            let frls: DAQAggregatorSnapshot.FRL[] = subFedBuilder.frls;
            let pseudoFeds: DAQAggregatorSnapshot.FED[] = subFedBuilder.feds;

            let additionalClasses: string | string[] = this.props.additionalClasses;
            let className: string = classNames("fb-table-subfb-row", additionalClasses);

            let ttcPartition: DAQAggregatorSnapshot.TTCPartition = subFedBuilder.ttcPartition;

            let ttsState: string = '';
            let ttsStateTcdsPm: string = ttcPartition.tcds_pm_ttsState ? ttcPartition.tcds_pm_ttsState.substring(0, 1) : 'x';
            let ttsStateTcdsApvPm: string  = ttcPartition.tcds_apv_pm_ttsState ? ttcPartition.tcds_apv_pm_ttsState.substring(0, 1) : 'x';


            if (ttcPartition.tcdsPartitionInfo && ttcPartition.tcdsPartitionInfo.nullCause) {
                ttsStateTcdsPm = ttcPartition.tcdsPartitionInfo.nullCause;
                ttsStateTcdsApvPm = ttcPartition.tcdsPartitionInfo.nullCause;
            }

            if (ttcPartition.topFMMInfo && ttcPartition.topFMMInfo.nullCause){
                ttsState = ttcPartition.topFMMInfo.nullCause;
            }else{
                if (ttcPartition.masked){
                    ttsState = '-';
                    ttsStateTcdsPm = '-';
                    ttsStateTcdsApvPm = '-';
                }else {
                    if (ttcPartition.fmm) {
                        if (ttcPartition.fmm.stateName === 'Ready' || ttcPartition.fmm.stateName === 'Enabled') {
                            ttsState = ttcPartition.ttsState ? ttcPartition.ttsState.substring(0, 1) : '?'
                        } else {
                            ttsState = '-';
                        }
                    } else {
                        ttsState = 'x';
                    }
                }
            }

            let ttsStateClasses: string = ttcPartition.ttsState ? 'fb-table-subfb-tts-state-' + ttsState : 'fb-table-subfb-tts-state-none';
            ttsStateClasses = classNames(ttsStateClasses, 'fb-table-subfb-tts-state');
            let ttsStateTcdsPmClasses: string = ttcPartition.tcds_pm_ttsState || ttcPartition.tcds_pm_ttsState != '-'? 'fb-table-subfb-tts-state-' + ttsStateTcdsPm : 'fb-table-subfb-tts-state-none';
            ttsStateTcdsPmClasses = classNames(ttsStateTcdsPmClasses, 'fb-table-subfb-tts-state');
            let ttsStateTcdsApvClasses: string = ttcPartition.tcds_apv_pm_ttsState || ttcPartition.tcds_apv_pm_ttsState != '-'? 'fb-table-subfb-tts-state-' + ttsStateTcdsApvPm : 'fb-table-subfb-tts-state-none';
            ttsStateTcdsApvClasses = classNames(ttsStateTcdsApvClasses, 'fb-table-subfb-tts-state');


            let minTrig: number = subFedBuilder.minTrig;
            let maxTrig: number = subFedBuilder.maxTrig;

            let minTrigUnequalMaxTrig: boolean = minTrig != maxTrig;
            let maxTrigGreaterThanZero: boolean = maxTrig > 0;

            let ttcPartitionTTSStateLink: any = ttsState;
            if (ttcPartition.fmm != null && ttcPartition.fmm.url != null && ttsState != '-' && ttsState != 'x' && ttsState.substring(0,2) != 'no') {
                ttcPartitionTTSStateLink =
                    <a href={ttcPartition.fmm.url + '/urn:xdaq-application:service=fmmcontroller'}
                       target="_blank" title={ttcPartition.ttsState}>{ttsState}</a>;
            }

            let tcdsControllerUrl: string = this.props.tcdsControllerUrl;
            let tcdsControllerServiceName: string = this.props.tcdsControllerServiceName;

            let ttcPartitionTTSStateTcdsPmLink: any = ttsStateTcdsPm;
            if (ttcPartition.tcds_pm_ttsState != null && ttcPartition.tcds_pm_ttsState != '-' && ttsStateTcdsPm != '-' && ttcPartition.tcds_pm_ttsState != 'x' && ttcPartition.tcds_pm_ttsState.substring(0,2) != 'no') {  //review this check
                ttcPartitionTTSStateTcdsPmLink =
                    <a href={tcdsControllerUrl + '/urn:xdaq-application:service='+ tcdsControllerServiceName}
                       target="_blank" title={ttcPartition.tcds_pm_ttsState}>{ttsStateTcdsPm}</a>;
            }

            let ttcPartitionTTSStateTcdsApvPmLink: any = ttsStateTcdsApvPm;
            if (ttcPartition.tcds_apv_pm_ttsState != null && ttcPartition.tcds_apv_pm_ttsState != '-' && ttsStateTcdsApvPm != '-' && ttcPartition.tcds_apv_pm_ttsState != 'x' && ttcPartition.tcds_pm_ttsState.substring(0,2) != 'no') {  //review this check
                ttcPartitionTTSStateTcdsApvPmLink =
                    <a href={tcdsControllerUrl + '/urn:xdaq-application:service='+ tcdsControllerServiceName}
                       target="_blank" title={ttcPartition.tcds_apv_pm_ttsState}>{ttsStateTcdsApvPm}</a>;
            }




            let ttcPartitionTTSStateDisplay_F: any = <span className={ttsStateClasses}>{ttcPartitionTTSStateLink}</span>;
            let ttcPartitionTTSStateDisplay_P: any = <span className={ttsStateTcdsPmClasses}>{ttcPartitionTTSStateTcdsPmLink}</span>;
            let ttcPartitionTTSStateDisplay_A: any = <span className={ttsStateTcdsApvClasses}>{ttcPartitionTTSStateTcdsApvPmLink}</span>;


            let ttcpPercWarn: string = ttcPartition.percentWarning != null ? ttcPartition.percentWarning.toFixed(1) : '-';
            let ttcpPercBusy: string = ttcPartition.percentWarning != null ? ttcPartition.percentBusy.toFixed(1) : '-';

            //on special cases of ttsState, percentages cannot be retrieved, therefore assign them the special state
            if (ttsState === '-' || ttsState === 'x' || ttsState === '?'){
                ttcpPercWarn = ttsState;
                ttcpPercBusy = ttsState;
            }
            if (ttcPartition.topFMMInfo.nullCause){
                ttcpPercWarn = ttcPartition.topFMMInfo.nullCause;
                ttcpPercBusy = ttcPartition.topFMMInfo.nullCause;
            }

            let evmMaxTrg: number = this.props.evmMaxTrg;

            let minTrigDisplayContent: any = '';
            let maxTrigDisplayContent: any = maxTrigGreaterThanZero ? maxTrig : '';

            if (minTrigUnequalMaxTrig) {
                minTrigDisplayContent = minTrig;
            }

            let minTrigClassNames: string = 'fb-table-subfb-min-trig';
            let maxTrigClassNames: string = 'fb-table-subfb-max-trig';

            if (evmMaxTrg != null) {
                if (minTrig != evmMaxTrg && minTrigUnequalMaxTrig) {
                    minTrigClassNames = classNames(minTrigClassNames, minTrigClassNames + '-unequal');
                } else {
                    minTrigClassNames = classNames(minTrigClassNames, minTrigClassNames + '-equal');
                }

                if (maxTrig != evmMaxTrg && maxTrigGreaterThanZero) {
                    maxTrigClassNames = classNames(maxTrigClassNames, maxTrigClassNames + '-unequal');
                } else {
                    maxTrigClassNames = classNames(maxTrigClassNames, maxTrigClassNames + '-equal');
                }
            }

            let frlpcStateDisplay: string = "";
            let frlpcStateDisplayClass: string = "";
            if (frlPc.crashed){
                frlpcStateDisplay = "JobCrash";
                frlpcStateDisplayClass = "fb-table-jobcrash";
            }

            let fmmAppStateDisplay: string = "";
            let fmmAppStateDisplayClass: string = "";
            if (ttcPartition.fmm && ttcPartition.fmm.fmmApplication && ttcPartition.fmm.fmmApplication.crashed){
                fmmAppStateDisplay = "JobCrash";
                fmmAppStateDisplayClass = "fb-table-jobcrash";
            }

            return (
                <tr className={className}>
                    <td>{ttcPartition.name}:{ttcPartition.ttcpNr}</td>
                    <td className="fb-table-subfb-tts-perc">{ttcPartitionTTSStateDisplay_P}</td>
                    <td className="fb-table-subfb-tts-perc">{ttcPartitionTTSStateDisplay_A}</td>
                    <td><div className="fb-table-subfb-tts-perc">{ttcPartitionTTSStateDisplay_F}</div>
                        <div className={fmmAppStateDisplayClass}>{fmmAppStateDisplay}</div>
                    </td>
                    <td className="fb-table-subfb-tts-perc">{ttcpPercWarn}</td>
                    <td className="fb-table-subfb-tts-perc">{ttcpPercBusy}</td>
                    <td><a href={frlPcUrl} target="_blank">{frlPcName}</a></td>
                    <td className={frlpcStateDisplayClass}>{frlpcStateDisplay}</td>
                    <FRLs frls={frls} minTrig={minTrigDisplayContent} pseudoFeds={pseudoFeds} drawZeroDataFlowComponent={drawZeroDataFlowComponent} ttcPartition={ttcPartition}/>
                    <td className={minTrigClassNames}>{minTrigDisplayContent}</td>
                    <td className={maxTrigClassNames}>{maxTrigDisplayContent}</td>
                    {this.props.additionalContent ? this.props.additionalContent : null}
                </tr>
            );
        }
    }

    interface FRLsProperties {
        frls: DAQAggregatorSnapshot.FRL[];
        pseudoFeds: DAQAggregatorSnapshot.FED[];
        minTrig: any;
        drawZeroDataFlowComponent: boolean;
        ttcPartition: DAQAggregatorSnapshot.TTCPartition;
    }

    class FRLs extends React.Component<FRLsProperties,{}> {
        render() {
            let frls: DAQAggregatorSnapshot.FRL[] = this.props.frls;

            let ttcPartition: DAQAggregatorSnapshot.TTCPartition = this.props.ttcPartition;

            let minTrigDisplayContent: any = this.props.minTrig;

            let drawZeroDataFlowComponent = this.props.drawZeroDataFlowComponent;

            let pseudoFEDs: DAQAggregatorSnapshot.FED[] = this.props.pseudoFeds;

            let fedData: any[] = [];
            let firstFrl: boolean = true;
            frls.forEach(function (frl: DAQAggregatorSnapshot.FRL) {
                fedData.push(<FRL key={frl['@id']} frl={frl} firstFrl={firstFrl} minTrig={minTrigDisplayContent} drawZeroDataFlowComponent={drawZeroDataFlowComponent} ttcPartition={ttcPartition}/>);
                firstFrl = false;
            });

            pseudoFEDs.forEach(function (fed: DAQAggregatorSnapshot.FED) {
                fedData.push(' ');
                fed.isPseudoFed = true; //this can be used for pseudofed-specific rendering at FEDData level
                fedData.push(<FEDData key={fed['@id']} fed={fed} minTrig={minTrigDisplayContent} drawZeroDataFlowComponent={drawZeroDataFlowComponent}/>);
            });

            return (
                <td>{fedData}</td>
            );
        }
    }

    interface FRLProperties {
        firstFrl: boolean;
        frl: DAQAggregatorSnapshot.FRL;
        minTrig: any;
        drawZeroDataFlowComponent: boolean;
        ttcPartition: DAQAggregatorSnapshot.TTCPartition;
    }

    class FRL extends React.Component<FRLProperties,{}> {
        render() {
            let frl: DAQAggregatorSnapshot.FRL = this.props.frl;
            let drawZeroDataFlowComponent = this.props.drawZeroDataFlowComponent;

            let minTrigDisplayContent: any = this.props.minTrig;

            let ttcPartition: DAQAggregatorSnapshot.TTCPartition = this.props.ttcPartition;

            let feds: {[key: string]: DAQAggregatorSnapshot.FED} = frl.feds;

            let firstFed: DAQAggregatorSnapshot.FED = feds && feds.hasOwnProperty("0") ? feds["0"] : null;
            let firstFedDisplay: any = firstFed && firstFed.ttcp.name === ttcPartition.name? <FEDData key={firstFed['@id']} fed={firstFed} minTrig={minTrigDisplayContent} drawZeroDataFlowComponent={drawZeroDataFlowComponent}/> : '-';
            let secondFed: DAQAggregatorSnapshot.FED = feds && feds.hasOwnProperty("1") ? feds["1"] : null;
            let secondFedDisplay: any = secondFed && secondFed.ttcp.name === ttcPartition.name? <FEDData key={secondFed['@id']} fed={secondFed} minTrig={minTrigDisplayContent} drawZeroDataFlowComponent={drawZeroDataFlowComponent}/> : '';
            let thirdFed: DAQAggregatorSnapshot.FED = feds && feds.hasOwnProperty("2") ? feds["2"] : null;
            let thirdFedDisplay: any = thirdFed && thirdFed.ttcp.name === ttcPartition.name? <FEDData key={thirdFed['@id']} fed={thirdFed} minTrig={minTrigDisplayContent} drawZeroDataFlowComponent={drawZeroDataFlowComponent}/> : '';
            let fourthFed: DAQAggregatorSnapshot.FED = feds && feds.hasOwnProperty("3") ? feds["3"] : null;
            let fourthFedDisplay: any = fourthFed && fourthFed.ttcp.name === ttcPartition.name? <FEDData key={fourthFed['@id']} fed={fourthFed} minTrig={minTrigDisplayContent} drawZeroDataFlowComponent={drawZeroDataFlowComponent}/> : '';

            let secondFedShown: boolean = secondFed && (secondFed && secondFed.ttcp.name === ttcPartition.name);
            let thirdFedShown: boolean = thirdFed && (thirdFed && thirdFed.ttcp.name === ttcPartition.name);
            let fourthFedShown: boolean = fourthFed && (fourthFed && fourthFed.ttcp.name === ttcPartition.name);


            let firstFrl: boolean = this.props.firstFrl;

            return (
                <span>
                    {firstFrl ? '' : ', '}{frl.geoSlot}:{firstFedDisplay}{secondFedShown ? ',' : ''}{secondFedDisplay}{thirdFedShown ? ',' : ''}{thirdFedDisplay}{fourthFedShown ? ',' : ''}{fourthFedDisplay}
                </span>
            );
        }
    }

    interface FEDDataProperties {
        fed: DAQAggregatorSnapshot.FED;
        minTrig: any;
        drawZeroDataFlowComponent: boolean;
    }

    class FEDData extends React.Component<FEDDataProperties,{}> {
        shouldComponentUpdate(nextProps: FEDDataProperties) {
            let shouldUpdate: boolean = false;

            let currentFMMIsNull: boolean = this.props.fed.fmm == null;
            let newFmmIsNull: boolean = nextProps.fed.fmm == null;
            if (currentFMMIsNull !== newFmmIsNull) {
                shouldUpdate = true;
            } else if (!currentFMMIsNull && !newFmmIsNull) {
                shouldUpdate = shouldUpdate || (this.props.fed.fmm.url !== nextProps.fed.fmm.url);
            }
            shouldUpdate = shouldUpdate || !DAQViewUtility.snapshotElementsEqualShallow(this.props.fed, nextProps.fed);

            return shouldUpdate;
        }

        render() {

            let drawZeroDataFlowComponent = this.props.drawZeroDataFlowComponent;

            let fed: DAQAggregatorSnapshot.FED = this.props.fed;

            let trigNum: number = fed.eventCounter;
            let minTrigDisplayContent: any = this.props.minTrig;

            let trigNumDisplay: any = '';

            if ((trigNum.toString() == minTrigDisplayContent) && drawZeroDataFlowComponent){
                trigNumDisplay = minTrigDisplayContent;
            }

            let minTrigClassNames: string = classNames('fb-table-fed-min-trig');

            let percentWarning: number = fed.percentWarning;
            let percentBusy: number = fed.percentBusy;

            let ttsState: string = fed.ttsState ? fed.ttsState.substring(0, 1) : '';

            let percentBackpressure: number = fed.percentBackpressure;

            let expectedSourceId: number = fed.srcIdExpected;
            let receivedSourceId: number = fed.srcIdReceived;

            let fedCRCErrors: number = fed.numFCRCerrors;
            let slinkCRCErrors: number = fed.numSCRCerrors;

            let percentWarningDisplay: any = percentWarning > 0 ?
                <span className="fb-table-fed-percent-warning">W:{percentWarning.toFixed(1)}%</span> : '';
            let percentBusyDisplay: any = percentBusy > 0 ?
                <span className="fb-table-fed-percent-busy">B:{percentBusy.toFixed(1)}%</span> : '';

            let ttsStateDisplay: string = (ttsState !== 'R' && ttsState.length !== 0) ? ttsState : '';

            let fedTTSStateLink: any = ttsState;
            if (fed.fmm != null && fed.fmm.url != null) {
                fedTTSStateLink =<a href={fed.fmm.url+'/urn:xdaq-application:service=fmmcontroller'}
                                    target="_blank">{ttsStateDisplay}</a>;
                ttsStateDisplay = fedTTSStateLink;
            }

            if (fed.fmmMasked || fed.frlMasked){
                ttsStateDisplay = '';
            }

            let ttsStateClass: string;
            let fedIdClasses: string = 'fb-table-fed-id';

            ttsStateClass = ttsStateDisplay.length !== 0 ? 'fb-table-fed-tts-state-' + ttsState : null;

            if (fed.frlMasked === true || (!fed.hasSLINK && fed.fmmMasked)) {
                fedIdClasses = classNames(fedIdClasses, 'fb-table-fed-frl-masked');
            } else if (ttsStateClass != null) {
                fedIdClasses = classNames(fedIdClasses, ttsStateClass);
            }

            if (fed.fmmMasked === true) {
                ttsStateClass = 'fb-table-fed-tts-state-fmm-masked';
            }

            let ttsStateClasses: string = classNames('fb-table-fed-tts-state', ttsStateClass);

            let percentBackpressureDisplay: any = percentBackpressure > 0 ?
                <span className="fb-table-fed-percent-backpressure">{'<'}{percentBackpressure.toFixed(1)}%</span> : '';

            let unexpectedSourceIdDisplay: any = '';
            if (!(fed.frlMasked === true) && receivedSourceId != expectedSourceId && receivedSourceId != 0) {
                unexpectedSourceIdDisplay =
                    <span className="fb-table-fed-received-source-id">rcvSrcId:{receivedSourceId}</span>;
            }

            let fedCRCErrorDisplay: any = fedCRCErrors > 0 ?
                <span className="fb-table-fed-crc-errors">#FCRC={fedCRCErrors}</span> : '';

            let slinkCRCErrorDisplay: any = slinkCRCErrors > 0 ?
                <span className="fb-table-slink-crc-errors">#SCRC={slinkCRCErrors}</span> : '';


            return (
                <span className="fb-table-fed">
                    {percentWarningDisplay}
                    {percentBusyDisplay}
                    <span className={ttsStateClasses}>
                        {ttsStateDisplay}
                    </span>
                    <span className={fedIdClasses}>
                        {expectedSourceId}
                    </span>
                    <span className={minTrigClassNames}>
                        {trigNumDisplay}
                    </span>
                    {percentBackpressureDisplay}
                    {unexpectedSourceIdDisplay}
                    {fedCRCErrorDisplay}
                    {slinkCRCErrorDisplay}
                </span>
            );
        }
    }

    interface FEDBuilderTableSummaryRowProperties {
        numRus: number;
        numUsedRus: number;
        fedBuilderSummary: DAQAggregatorSnapshot.FEDBuilderSummary;
        drawPausedComponent: boolean;
        drawZeroDataFlowComponent: boolean;
        drawStaleSnapshot: boolean;
    }

    class FEDBuilderTableSummaryRow extends React.Component<FEDBuilderTableSummaryRowProperties,{}> {
        shouldComponentUpdate(nextProps: FEDBuilderTableSummaryRowProperties) {
            return true; //this can be optimized
            //return this.props.numRus !== nextProps.numRus || !snapshotElementsEqualShallow(this.props.fedBuilderSummary, nextProps.fedBuilderSummary);
        }

        render() {
            let fedBuilderSummary: DAQAggregatorSnapshot.FEDBuilderSummary = this.props.fedBuilderSummary;
            let drawPausedComponent: boolean = this.props.drawPausedComponent;
            let drawZeroDataFlowComponent = this.props.drawZeroDataFlowComponent;
            let drawStaleSnapshot = this.props.drawStaleSnapshot;
            let fbSummaryRowClass: string = drawPausedComponent ? "fb-table-fb-summary-row-paused" : "fb-table-fb-summary-row-running";


            let fragmentInRuClass: string = FormatUtility.getClassNameForNumber(fedBuilderSummary.sumFragmentsInRU, FBTableNumberFormats.FRAGMENTS_IN_RU);
            let eventsInRuClass: string = FormatUtility.getClassNameForNumber(fedBuilderSummary.sumEventsInRU, FBTableNumberFormats.EVENTS_IN_RU);
            let requestsClass: string = FormatUtility.getClassNameForNumber(fedBuilderSummary.sumRequests, FBTableNumberFormats.REQUESTS);

            if (drawZeroDataFlowComponent) {
                fbSummaryRowClass = "fb-table-fb-summary-row-ratezero";

                if (!drawStaleSnapshot) {

                    let escapeRedField: string = 'fb-table-ru-red-column-escape';

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

            if (drawStaleSnapshot && (!drawPausedComponent)){
                fbSummaryRowClass = 'fb-table-fb-summary-row-stale-page';
            }

            return (
                <tr className={classNames(fbSummaryRowClass, "fb-table-fb-row-counter")}>
                    <td colSpan="12"></td>
                    <td>Σ {this.props.numUsedRus} / {this.props.numRus}</td>
                    <td></td>
                    <td></td>
                    <td className={FormatUtility.getClassNameForNumber(fedBuilderSummary.rate / 100, FBTableNumberFormats.RATE)}>{(fedBuilderSummary.rate / 1000).toFixed(3)}</td>
                    <td className={FormatUtility.getClassNameForNumber(fedBuilderSummary.throughput / 1000 / 1000, FBTableNumberFormats.THROUGHPUT)}>Σ {(fedBuilderSummary.throughput / 1000 / 1000).toFixed(1)}</td>
                    <td className={FormatUtility.getClassNameForNumber(fedBuilderSummary.superFragmentSizeMean / 1000, FBTableNumberFormats.SIZE)}>
                        Σ {(fedBuilderSummary.superFragmentSizeMean / 1000).toFixed(1)}±{(fedBuilderSummary.superFragmentSizeStddev / 1000).toFixed(1)}</td>
                    <td className={FormatUtility.getClassNameForNumber(fedBuilderSummary.deltaEvents, FBTableNumberFormats.EVENTS)}>Δ {fedBuilderSummary.deltaEvents}</td>
                    <td className={fragmentInRuClass}>Σ {fedBuilderSummary.sumFragmentsInRU}</td>
                    <td className={eventsInRuClass}>Σ {fedBuilderSummary.sumEventsInRU}</td>
                    <td className={requestsClass}>Σ {fedBuilderSummary.sumRequests}</td>
                </tr>
            );
        }
    }


}