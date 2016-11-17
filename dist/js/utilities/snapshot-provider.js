var DAQAggregator;
(function (DAQAggregator) {
    var SnapshotProvider = (function () {
        function SnapshotProvider(snapshotSource) {
            this.running = false;
            this.views = [];
            this.snapshotSource = snapshotSource;
        }
        SnapshotProvider.prototype.addView = function (view) {
            this.views.push(view);
        };
        SnapshotProvider.prototype.setSnapshot = function (snapshot) {
            this.views.forEach(function (view) { return view.setSnapshot(snapshot); });
        };
        SnapshotProvider.prototype.isRunning = function () {
            return this.running;
        };
        SnapshotProvider.prototype.start = function () {
            if (this.running) {
                return;
            }
            this.running = true;
            var updateFunction = (function () {
                if (!this.running) {
                    return;
                }
                var url = this.snapshotSource.getSourceURL();
                var startTime = new Date().getTime();
                var snapshotRequest = jQuery.getJSON(url);
                snapshotRequest.done((function (snapshotJSON) {
                    var time = new Date().getTime() - startTime;
                    console.log('Time to get snapshot: ' + time + 'ms');
                    var malformedSnapshot = false;
                    if (!snapshotJSON.hasOwnProperty("@id")) {
                        console.log("Malformed snapshot received, parsing and updating won't be launched until next valid snapshot");
                        console.log(snapshotJSON);
                        malformedSnapshot = true;
                    }
                    if (!malformedSnapshot) {
                        var snapshot = void 0;
                        startTime = new Date().getTime();
                        if (this.snapshotSource.parseSnapshot) {
                            snapshot = this.snapshotSource.parseSnapshot(snapshotJSON);
                        }
                        else {
                            snapshot = new DAQAggregator.Snapshot(snapshotJSON);
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
                snapshotRequest.fail((function () {
                    console.log("Error in remote snapshot request, retrying after " + this.snapshotSource.updateInterval + " millis");
                    setTimeout(updateFunction, this.snapshotSource.updateInterval);
                }).bind(this));
            }).bind(this);
            setTimeout(updateFunction, this.snapshotSource.updateInterval);
        };
        SnapshotProvider.prototype.stop = function () {
            this.running = false;
        };
        return SnapshotProvider;
    }());
    DAQAggregator.SnapshotProvider = SnapshotProvider;
})(DAQAggregator || (DAQAggregator = {}));
