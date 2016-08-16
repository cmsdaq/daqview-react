namespace DAQAggregator {

    import DAQSnapshotView = DAQView.DAQSnapshotView;

    export class SnapshotProvider implements DAQSnapshotView {
        private snapshotSource: SnapshotSource;
        private isRunning: boolean = false;

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

        public start() {
            if (this.isRunning) {
                return;
            }
            this.isRunning = true;

            let updateFunction: () => void = (function () {
                if (!this.isRunning) {
                    return;
                }

                let url: string = this.snapshotSource.getSourceURL();

                let startTime: number = new Date().getTime();
                let snapshotRequest = jQuery.getJSON(url);

                snapshotRequest.done((function (snapshotJSON: any) {
                    let time: number = new Date().getTime() - startTime;
                    console.log('Time to get snapshot: ' + time + 'ms');

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

                    setTimeout(updateFunction, this.snapshotSource.updateInterval);
                }).bind(this));
            }).bind(this);
            setTimeout(updateFunction, this.snapshotSource.updateInterval);
        }

        public stop() {
            this.isRunning = false;
        }
    }

}