/**
 * Created by mvougiou on 1/11/17.
 */

/**
 * @author Michail Vougioukas
 * @author Philipp Brummer
 */

namespace DAQView {

    import DAQAggregatorSnapshot = DAQAggregator.Snapshot;
    import DAQ = DAQAggregator.Snapshot.DAQ;

    export class SnapshotModal implements DAQView.DAQSnapshotView {
        public htmlRootElement: Element;

        private snapshot: DAQAggregatorSnapshot;
        private drawPausedComponent: boolean = false;
        private url: string = "";

        constructor(htmlRootElementName: string) {
            this.htmlRootElement = document.getElementById(htmlRootElementName);
        }

        public setSnapshot(snapshot: DAQAggregatorSnapshot, drawPausedComponent: boolean, drawZeroDataFlowComponent:boolean, drawStaleSnapshot:boolean, url:string) {
            this.snapshot = snapshot;
            this.drawPausedComponent = drawPausedComponent;
            this.url = url;

            if (!snapshot){
                let msg: string = "";
                let errRootElement: any = <ErrorElement message={msg}/>;
                ReactDOM.render(errRootElement, this.htmlRootElement);
            }else{


            let daq: DAQAggregatorSnapshot.DAQ = snapshot.getDAQ();

            let snapshotModalRootElement: any = <SnapshotModalElement snapshot={snapshot} url={url}/>;
            ReactDOM.render(snapshotModalRootElement, this.htmlRootElement);
            }
        }
    }

    interface SnapshotModalElementProperties {
        snapshot: DAQAggregatorSnapshot;
        url: string;
    }

    class SnapshotModalElement extends React.Component<SnapshotModalElementProperties,{}> {
        render() {
            return (
                    <a href={this.props.url} target="_blank"><button className="button-snapshot">See raw DAQ snapshot</button></a>
        );
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