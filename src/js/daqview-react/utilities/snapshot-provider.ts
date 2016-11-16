namespace DAQAggregator {

    import DAQSnapshotView = DAQView.DAQSnapshotView;

    export class SnapshotProvider implements DAQSnapshotView {
        private snapshotSource: SnapshotSource;
        private running: boolean = false;

        private views: DAQSnapshotView[] = [];

        constructor(snapshotSource: SnapshotSource) {
            this.snapshotSource = snapshotSource;
        }

        public addView(view: DAQSnapshotView) {
            this.views.push(view);
        }

        public setSnapshot(snapshot: Snapshot) {
            this.views.forEach(view => view.setSnapshot(snapshot));
        }

        public isRunning(): boolean {
            return this.running;
        }

        public start() {
            if (this.running) {
                return;
            }
            this.running = true;

            let updateFunction: () => void = (function () {
                if (!this.running) {
                    return;
                }

                let url: string = this.snapshotSource.getSourceURL();

                let startTime: number = new Date().getTime();
                let snapshotRequest = jQuery.getJSON(url);

                snapshotRequest.done((function (snapshotJSON: any) {
                    let time: number = new Date().getTime() - startTime;
                    console.log('Time to get snapshot: ' + time + 'ms');

                    let malformedSnapshot: boolean = false;
                    if (!snapshotJSON.hasOwnProperty("@id")){
                        console.log("Malformed snapshot received, parsing and updating won't be launched until next valid snapshot");
                        console.log(snapshotJSON);
                        malformedSnapshot = true;
                    }

                    if (!malformedSnapshot) {
                        let snapshot: Snapshot;
                        startTime = new Date().getTime();
                        if (this.snapshotSource.parseSnapshot) {
                            snapshot = this.snapshotSource.parseSnapshot(snapshotJSON);
                        } else {
                            snapshot = new Snapshot(snapshotJSON);
                        }
                        time = new Date().getTime() - startTime;
                        console.log('Time to parse snapshot: ' + time + 'ms');

                        startTime = new Date().getTime();
                        this.setSnapshot(snapshot);
                        time = new Date().getTime() - startTime;
                        console.log('Time to update page: ' + time + 'ms');
                    }

                    setTimeout(updateFunction, this.snapshotSource.updateInterval);
                }).bind(this));

                snapshotRequest.fail((function (){
                    console.log("Error in remote snapshot request, retrying after "+this.snapshotSource.updateInterval+" millis");
                    setTimeout(updateFunction, this.snapshotSource.updateInterval);
                }).bind(this));


            }).bind(this);




            setTimeout(updateFunction, this.snapshotSource.updateInterval);
        }

        public stop() {
            this.running = false;
        }
    }

}