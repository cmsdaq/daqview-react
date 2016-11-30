namespace DAQView {

    import DAQAggregatorSnapshot = DAQAggregator.Snapshot;
    import DAQ = DAQAggregator.Snapshot.DAQ;

    export class AboutTable implements DAQView.DAQSnapshotView {
        public htmlRootElement: Element;

        private snapshot: DAQAggregatorSnapshot;

        constructor(htmlRootElementName: string) {
            this.htmlRootElement = document.getElementById(htmlRootElementName);
        }

        public setSnapshot(snapshot: DAQAggregatorSnapshot) {
            let aboutTableRootElement: any = <AboutTableElement project={"DAQView - React.js"}
                                                                      authors={"Michail Vougioukas, Philipp Brummer"}
                                                                      organization={"CERN CMS DAQ Group"}
                                                                      year={2016}/>;
            ReactDOM.render(aboutTableRootElement, this.htmlRootElement);
        }
    }

    interface MetadataTableElementProperties {
        project: string;
        authors: string;
        organization: string;
        year: number;
    }

    class AboutTableElement extends React.Component<MetadataTableElementProperties,{}> {
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