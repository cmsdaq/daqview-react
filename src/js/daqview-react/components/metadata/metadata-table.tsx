namespace DAQView {

    import DAQAggregatorSnapshot = DAQAggregator.Snapshot;
    import DAQ = DAQAggregator.Snapshot.DAQ;

    export class MetadataTable implements DAQView.DAQSnapshotView {
        public htmlRootElement: Element;

        private snapshot: DAQAggregatorSnapshot;

        constructor(htmlRootElementName: string) {
            this.htmlRootElement = document.getElementById(htmlRootElementName);
        }

        public setSnapshot(snapshot: DAQAggregatorSnapshot) {
            this.snapshot = snapshot;
            let daq: DAQAggregatorSnapshot.DAQ = snapshot.getDAQ();
            let metadataTableRootElement: any = <MetadataTableElement runNumber={daq.runNumber}
                                                                      sessionId={daq.sessionId}
                                                                      dpSetPath={daq.dpsetPath}
                                                                      snapshotTimestamp={daq.lastUpdate}
                                                                      lv0State={daq.levelZeroState}
                                                                      daqState={daq.daqState}
                                                                      machineState={daq.lhcMachineMode}
                                                                      beamState={daq.lhcBeamMode}/>;
            ReactDOM.render(metadataTableRootElement, this.htmlRootElement);
        }
    }

    interface MetadataTableElementProperties {
        runNumber: number;
        sessionId: number;
        dpSetPath: string;
        snapshotTimestamp: number;
        lv0State?: string;
        lv0StateTimestamp?: number;
        daqState?: string;
        machineState?: string;
        beamState?: string;
    }

    class MetadataTableElement extends React.Component<MetadataTableElementProperties,{}> {
        render() {
            return (
                <table className="metadata-table">
                    <thead className="metadata-table-head">
                    <tr className="metadata-table-header-row">
                        <th>Run</th>
                        <th>LV0 state</th>
                        <th>LV0 state entry time</th>
                        <th>DAQ state</th>
                        <th>Machine state</th>
                        <th>Beam state</th>
                        <th>Session ID</th>
                        <th>DAQ configuration</th>
                        <th>Snapshot timestamp</th>
                    </tr>
                    </thead>
                    <tbody className="metadata-table-body">
                    <tr className="metadata-table-content-row">
                        <td>{this.props.runNumber}</td>
                        <td>{this.props.lv0State}</td>
                        <td>{this.props.lv0StateTimestamp ? this.props.lv0StateTimestamp : 'Unknown'}</td>
                        <td>{this.props.daqState}</td>
                        <td>{this.props.machineState}</td>
                        <td>{this.props.beamState}</td>
                        <td>{this.props.sessionId}</td>
                        <td>{this.props.dpSetPath}</td>
                        <td>{new Date(this.props.snapshotTimestamp).toLocaleString()}</td>
                    </tr>
                    </tbody>
                </table>
            );
        }
    }
}