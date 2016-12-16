/**
 * @author Michail Vougioukas
 * @author Philipp Brummer
 */
var DAQAggregator;
(function (DAQAggregator) {
    var SnapshotProvider = (function () {
        function SnapshotProvider(snapshotSource) {
            this.running = false;
            this.inRealTimePolling = true;
            this.instructionToStop = false;
            this.drawPausedPage = false;
            this.previousUrl = "";
            this.pauseCallerType = 0; //by default all pause calls are asssumed to be originated from the real time mode
            this.views = [];
            this.snapshotSource = snapshotSource;
        }
        SnapshotProvider.prototype.addView = function (view) {
            this.views.push(view);
        };
        SnapshotProvider.prototype.setSnapshot = function (snapshot, drawPausedPage) {
            this.views.forEach(function (view) { return view.setSnapshot(snapshot, drawPausedPage); });
        };
        SnapshotProvider.prototype.isRunning = function () {
            return this.running;
        };
        SnapshotProvider.prototype.isInRealTimePolling = function () {
            return this.inRealTimePolling;
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
                //retrieves previous url for local use, before updating its value is updated
                var previousUrlTemp = this.previousUrl;
                var url = this.snapshotSource.getSourceURL();
                if (!this.inRealTimePolling) {
                    url = this.snapshotSource.getSourceURLForGotoRequests();
                    console.log('In go-to-time snapshot provider mode');
                }
                else {
                    console.log('In real-time snapshot provider mode');
                }
                //updates global previousUrl holder with this call's url
                this.previousUrl = url;
                //at this point, this will stop the provider after completing the current snapshot request and daqview update
                if (this.instructionToStop) {
                    this.stop();
                    this.instructionToStop = false; //reset value immediately: it only needs to be true once and then be clean for later usages of the method
                    this.drawPausedPage = true; //triggers page draw with pause color scheme
                    /*retain previous snapshot if instruction to stop has been called from real-time mode,
                    otherwise draw requested snaphost if instruction to stop is a result of a go-to-time request*/
                    if (this.pauseCallerType == 0) {
                        url = previousUrlTemp;
                    }
                }
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
                        this.setSnapshot(snapshot, this.drawPausedPage);
                        //reset value after use
                        this.drawPausedPage = false;
                        time = new Date().getTime() - startTime;
                        console.log('Time to update page: ' + time + 'ms');
                        window.history.replaceState(null, null, "?time=" + (new Date(snapshot.getUpdateTimestamp()).toISOString()));
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
        //this method will immediately stop page updating (including both values and graphics)
        SnapshotProvider.prototype.stop = function () {
            this.running = false;
        };
        SnapshotProvider.prototype.switchToRealTime = function () {
            this.inRealTimePolling = true;
        };
        SnapshotProvider.prototype.switchToGotoTimeRequests = function () {
            this.inRealTimePolling = false;
        };
        /*arg 0 if called from a real time updating context, arg 1 if called from a go-to-time-and-pause context*/
        SnapshotProvider.prototype.provideOneMoreSnapshotAndStop = function (callerType) {
            this.pauseCallerType = callerType;
            this.instructionToStop = true;
        };
        return SnapshotProvider;
    }());
    DAQAggregator.SnapshotProvider = SnapshotProvider;
})(DAQAggregator || (DAQAggregator = {}));
