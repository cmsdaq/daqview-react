/**
 * Created by mvougiou on 1/11/17.
 */

/**
 * @author Michail Vougioukas
 * @author Philipp Brummer
 */

namespace DAQView {

    import DAQAggregatorSnapshot = DAQAggregator.Snapshot;

    export class SnapshotModal implements DAQView.DAQSnapshotView {
        public htmlRootElement: Element;
        private configuration: DAQViewConfiguration;

        private snapshot: DAQAggregatorSnapshot;
        private drawPausedComponent: boolean = false;
        private rawSnapshotUrl: string = "";
        private expertUrl: string = null;
        private isExpertSetup: boolean = false;

        constructor(htmlRootElementName: string, configuration: DAQViewConfiguration) {
            this.htmlRootElement = document.getElementById(htmlRootElementName);
            this.configuration = configuration;
            this.isExpertSetup = this.configuration.expertSetups.some(setup => setup === this.configuration.setupName);
        }

        public setSnapshot(snapshot: DAQAggregatorSnapshot, drawPausedComponent: boolean, drawZeroDataFlowComponent:boolean, drawStaleSnapshot:boolean) {
            this.snapshot = snapshot;
            this.drawPausedComponent = drawPausedComponent;

            if (!snapshot) {
                let msg: string = "";
                let errRootElement: any = <ErrorElement message={msg}/>;
                ReactDOM.render(errRootElement, this.htmlRootElement);
            } else {
                let daq: DAQAggregatorSnapshot.DAQ = snapshot.getDAQ();
                let time: number = snapshot.getUpdateTimestamp();

                let timeString: string = new Date(time).toISOString();
                this.rawSnapshotUrl = this.configuration.snapshotSource.url + "?setup=" + this.configuration.setupName + "&time=\"" + timeString + "\"";

                if (this.isExpertSetup && this.configuration.externalLinks.daqExpert !== null) {
                    // set expert browser range to 5 minutes before and after snapshot
                    let expertStartTimeString = new Date(time - 300000).toISOString();
                    let expertEndTimeString = new Date(time + 300000).toISOString();

                    this.expertUrl = this.configuration.externalLinks.daqExpert + "?start=" + expertStartTimeString + "&end=" + expertEndTimeString;
                }

                let snapshotModalRootElement: any = <SnapshotModalElement expertUrl={this.expertUrl} rawSnapshotUrl={this.rawSnapshotUrl}/>;
                ReactDOM.render(snapshotModalRootElement, this.htmlRootElement);
            }
        }

        //to be called before setSnapshot
        public prePassElementSpecificData(args: string []){

        }
    }

    interface SnapshotModalElementProperties {
        rawSnapshotUrl: string;
        expertUrl: string;
    }

    class SnapshotModalElement extends React.Component<SnapshotModalElementProperties,{}> {
        render() {
            let expertUrlButton: any = "";
            if (this.props.expertUrl !== null) {
                expertUrlButton = <a href={this.props.expertUrl} target="_blank"><button className="button-expert">DAQExpert</button></a>;
            }

            return (
                <div>
                    <button className="button-share">Share</button>
                    {expertUrlButton}
                    <a href={this.props.rawSnapshotUrl} target="_blank"><button className="button-snapshot">See raw DAQ snapshot</button></a>
                </div>);
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


}