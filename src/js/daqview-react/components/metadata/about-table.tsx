/**
 * @author Michail Vougioukas
 */

namespace DAQView {

    import DAQAggregatorSnapshot = DAQAggregator.Snapshot;
    import DAQ = DAQAggregator.Snapshot.DAQ;

    export class AboutTable implements DAQView.DAQSnapshotView{
        public htmlRootElement: Element;

        private snapshot: DAQAggregatorSnapshot;
        private drawPausedComponent: boolean = false;

        constructor(htmlRootElementName: string) {
            this.htmlRootElement = document.getElementById(htmlRootElementName);
        }

        public setSnapshot(snapshot: DAQAggregatorSnapshot, drawPausedComponent: boolean, drawZeroDataFlowComponent:boolean, drawStaleSnapshot:boolean, url:string) {
            this.snapshot = snapshot;
            this.drawPausedComponent = drawPausedComponent;

            let aboutTableRootElement: any = <AboutTableElement       project={"DAQView"}
                                                                      authors={"Michail Vougioukas, Philipp Brummer"}
                                                                      organization={"CERN CMS DAQ Group"}
                                                                      year={"2016-2017"}/>;
            ReactDOM.render(aboutTableRootElement, this.htmlRootElement);
        }
    }

    interface AboutTableElementProperties {
        project: string;
        authors: string;
        organization: string;
        year: string;
    }

    class AboutTableElement extends React.Component<AboutTableElementProperties,{}> {
        render() {
            return (
                <table className="about-table">
                    <tbody className="about-table-body">
                    <tr className="about-table-content-row">
                        <td>{this.props.project}</td>
                        <td>{this.props.authors}</td>
                        <td>{this.props.organization}</td>
                        <td>{this.props.year}</td>
                    </tr>
                    </tbody>
                </table>
            );
        }
    }
}