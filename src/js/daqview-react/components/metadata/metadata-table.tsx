/**
 * @author Michail Vougioukas
 * @author Philipp Brummer
 */

namespace DAQView {

    import DAQAggregatorSnapshot = DAQAggregator.Snapshot;
    import DAQ = DAQAggregator.Snapshot.DAQ;

    export class MetadataTable implements DAQView.DAQSnapshotView {
        public htmlRootElement: Element;

        private snapshot: DAQAggregatorSnapshot;
        private drawPausedComponent: boolean = false;
        private drawStaleSnapshot: boolean = false;

        private runInfoTimelineLink: string = '';

        constructor(htmlRootElementName: string) {
            this.htmlRootElement = document.getElementById(htmlRootElementName);
        }

        public setSnapshot(snapshot: DAQAggregatorSnapshot, drawPausedComponent: boolean, drawZeroDataFlowComponent:boolean, drawStaleSnapshot:boolean, url:string) {
            this.snapshot = snapshot;
            this.drawPausedComponent = drawPausedComponent;
            this.drawStaleSnapshot = drawStaleSnapshot;

            if (!snapshot){
                let msg: string = "Monitoring data unavailable: "+url;
                let errRootElement: any = <ErrorElement message={msg} details={""}/>;
                ReactDOM.render(errRootElement, this.htmlRootElement);
            }else{

                let daq: DAQAggregatorSnapshot.DAQ = snapshot.getDAQ();

                let metadataTableRootElement: any = <MetadataTableElement runNumber={daq.runNumber}

                                                                      sessionId={daq.sessionId}
                                                                      dpSetPath={daq.dpsetPath}
                                                                      snapshotTimestamp={daq.lastUpdate}
                                                                      lv0State={daq.levelZeroState}
                                                                      daqState={daq.daqState}
                                                                      machineState={daq.lhcMachineMode}
                                                                      beamState={daq.lhcBeamMode}
                                                                    drawPausedComponent={drawPausedComponent}
                                                                    drawStaleSnapshot={drawStaleSnapshot}
                                                                    runInfoTimelineLink={this.runInfoTimelineLink}
                                                                    lv0StateTimestamp={daq.levelZeroStateEntry}
                                                                    runStartTime={daq.runStart}
                                                                    runDurationInMillis={daq.runDurationInMillis}
                                                                    daqAggregatorVersion={daq.daqAggregatorProducer}/>;
                ReactDOM.render(metadataTableRootElement, this.htmlRootElement);
            }
        }

        //to be called before setSnapshot
        public prePassElementSpecificData(args: string []){
            this.runInfoTimelineLink = args[0];
        }
    }


    interface MetadataTableElementProperties {
        runNumber: number;
        runStartTime: number;
        runDurationInMillis: number;
        sessionId: number;
        dpSetPath: string;
        snapshotTimestamp: number;
        lv0State?: string;
        lv0StateTimestamp?: number;
        daqState?: string;
        machineState?: string;
        beamState?: string;
        drawPausedComponent: boolean;
        drawStaleSnapshot: boolean;
        runInfoTimelineLink: string;
        daqAggregatorVersion: string;
    }

    class MetadataTableElement extends React.PureComponent<MetadataTableElementProperties,{}> {

        render() {

            let timestampClass: string = this.props.drawStaleSnapshot && (!this.props.drawPausedComponent)? 'metadata-table-stale-page' : '';
            let snapshotDebug: string = this.props.drawStaleSnapshot && (!this.props.drawPausedComponent)? "Check whether L0 Dynamic flashlist is there! If yes, check if DAQAggregator is running! If yes, check its logs!" : "";

            let durationDescription: string = "";

            if (this.props.runStartTime && this.props.runDurationInMillis){
                let millis = this.props.runDurationInMillis;

                let days: number = Math.floor(millis / 86400000);
                let hours: number = Math.floor((millis - days*86400000) / 3600000);
                let minutes: number = Math.floor((millis - days*86400000 - hours*3600000) / 60000);
                let seconds: number = Math.floor((millis - days*86400000 - hours*3600000 - minutes*60000) / 1000);

                durationDescription += days ? days+"d, " : "";
                durationDescription += (hours || days) ? hours+"h, " : "";
                durationDescription += (minutes || hours || days) ? minutes+"m, " : "";
                durationDescription += (seconds || minutes || hours || days) ? seconds+"s ago " : "";

            }

            let version: string = this.props.daqAggregatorVersion ?  this.props.daqAggregatorVersion.substring(0, this.props.daqAggregatorVersion.length-4) : "Unknown";

            let snapshotOnHoverMessage: string = "Timestamp: "+this.props.snapshotTimestamp+"\nProduced by: "+version;

            if (snapshotDebug.length>1){
                snapshotOnHoverMessage = snapshotOnHoverMessage + "\n\n" + snapshotDebug;
            }


            return (
                <table className="metadata-table">
                    <thead className="metadata-table-head">
                    <tr className="metadata-table-header-row">
                        <th>Run number</th>
                        <th>Run start time (local)</th>
                        <th>LV0 state</th>
                        <th>LV0 state entry time (local)</th>
                        <th>DAQ state</th>
                        <th>Machine state</th>
                        <th>Beam state</th>
                        <th>Session ID</th>
                        <th>DAQ configuration</th>
                        <th>Snapshot time (local)</th>
                    </tr>
                    </thead>
                    <tbody className="metadata-table-body">
                    <tr className="metadata-table-content-row">
                        <td><a href={this.props.runInfoTimelineLink+"?run="+(this.props.runNumber? this.props.runNumber : '0')} target="_blank">{(this.props.runNumber? this.props.runNumber : '0')}</a></td>
                        <td>
                            <div>{this.props.runStartTime ? this.formatHumanReadableTimestamp(this.props.runStartTime) : 'Not started'}</div>
                            <div className="metadata-table-run-duration">{durationDescription}</div>
                        </td>
                        <td>{this.props.lv0State}</td>
                        <td>{this.props.lv0StateTimestamp ? this.formatHumanReadableTimestamp(this.props.lv0StateTimestamp) : 'Unknown'}</td>
                        <td>{this.props.daqState}</td>
                        <td>{this.props.machineState}</td>
                        <td>{this.props.beamState}</td>
                        <td><a href={this.props.runInfoTimelineLink+"?sessionId="+this.props.sessionId} target="_blank">{this.props.sessionId}</a></td>
                        <td>{this.props.dpSetPath}</td>
                        <td className={timestampClass}>
                            <div title={snapshotOnHoverMessage}>{this.formatHumanReadableTimestamp(this.props.snapshotTimestamp)}</div>
                        </td>
                    </tr>
                    </tbody>
                </table>
            );
        }


        formatHumanReadableTimestamp(dateTs: number): string{
            let ret: string = "";

            let dateTokens: string[] = new Date(dateTs).toString().split(" ");

            let mapOfMonths: {[key: string]: string} =
            {
                "Jan" : "01",
                "Feb" : "02",
                "Mar" : "03",
                "Apr" : "04",
                "May" : "05",
                "Jun" : "06",
                "Jul" : "07",
                "Aug" : "08",
                "Sep" : "09",
                "Oct" : "10",
                "Nov" : "11",
                "Dec" : "12"
            };

            ret = dateTokens[0]+" "+ dateTokens[2]+"/"+mapOfMonths[dateTokens[1]]+"/"+dateTokens[3]+", "+dateTokens[4]+" "+dateTokens[5]+" "+dateTokens[6];

            return ret;
        }
    }

    interface ErrorElementProperties {
        message: string;
        details: string;
    }

    class ErrorElement extends React.PureComponent<ErrorElementProperties,{}> {
        render() {
            return (
                <table className="metadata-table">
                    <thead className="metadata-table-head">
                    <tr className="metadata-error-table-header-row">
                        <th>{this.props.message}</th>
                    </tr>
                    </thead>
                    <tbody className="metadata-table-body">
                    <tr className="metadata-error-table-content-row">
                        <td>{this.props.details}</td>
                    </tr>
                    </tbody>
                </table>
            );
        }
    }
}