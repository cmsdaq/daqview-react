namespace DAQView {

    import DAQAggregatorSnapshot = DAQAggregator.Snapshot;
    import DAQ = DAQAggregator.Snapshot.DAQ;

    export class LoaderReplacement implements DAQView.DAQSnapshotView{
        public htmlRootElement: Element;

        private snapshot: DAQAggregatorSnapshot;

        constructor(htmlRootElementName: string) {
            this.htmlRootElement = document.getElementById(htmlRootElementName);
        }

        public setSnapshot(snapshot: DAQAggregatorSnapshot) {
            this.snapshot = snapshot;
            let loaderReplacementRootElement: any = <LoaderReplacementElement
                                                        placeholder={""}/>;
            ReactDOM.render(loaderReplacementRootElement, this.htmlRootElement);
        }
    }

    interface LoaderReplacementElementProperties {
        placeholder: string;
    }

    class LoaderReplacementElement extends React.Component<LoaderReplacementElementProperties,{}> {
        render() {
            return (
                <p>{this.props.placeholder}</p>
            );
        }
    }
}