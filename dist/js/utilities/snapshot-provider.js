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
            this.mapOfMonths = {
                "Jan": "01",
                "Feb": "02",
                "Mar": "03",
                "Apr": "04",
                "May": "05",
                "Jun": "06",
                "Jul": "07",
                "Aug": "08",
                "Sep": "09",
                "Oct": "10",
                "Nov": "11",
                "Dec": "12"
            };
            this.snapshotSource = snapshotSource;
        }
        SnapshotProvider.prototype.addView = function (view) {
            this.views.push(view);
        };
        SnapshotProvider.prototype.prePassElementSpecificData = function (args) {
            this.views.forEach(function (view) { return view.prePassElementSpecificData(args); });
        };
        SnapshotProvider.prototype.setSnapshot = function (snapshot, drawPausedPage, drawZeroDataFlowComponent, drawStaleSnapshot, url) {
            this.views.forEach(function (view) { return view.setSnapshot(snapshot, drawPausedPage, drawZeroDataFlowComponent, drawStaleSnapshot, url); });
        };
        SnapshotProvider.prototype.isRunning = function () {
            return this.running;
        };
        SnapshotProvider.prototype.isInRealTimePolling = function () {
            return this.inRealTimePolling;
        };
        SnapshotProvider.prototype.start = function () {
            console.log(("Snapshot provided start() at: " + new Date().toISOString()));
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
                var url = this.snapshotSource.getSourceURL(); //url to snapshot source, not to daqview (must be compatible with server's expected format)
                if (!this.inRealTimePolling) {
                    url = this.snapshotSource.getSourceURLForGotoRequests();
                    console.log('In go-to-time snapshot provider mode');
                }
                else {
                    console.log('In real-time snapshot provider mode');
                }
                //updates global previousUrl holder with this call's url and current timestamp (only to be used with possible subsequent go-to-time request)
                this.previousUrl = url + "&time=\"" + (new Date().toISOString()) + "\""; //quotes for server url compatibility
                //at this point, this will stop the provider after completing the current snapshot request and daqview update
                if (this.instructionToStop) {
                    console.log('Instructed to stop');
                    this.stop();
                    this.instructionToStop = false; //reset value immediately: it only needs to be true once and then be clean for later usages of the method
                    this.drawPausedPage = true; //triggers page draw with pause color scheme
                    /*retain previous snapshot if instruction to stop has been called from real-time mode,
                     otherwise draw requested snaphost if instruction to stop is a result of a go-to-time request*/
                    if (this.pauseCallerType == 0) {
                        url = previousUrlTemp;
                        console.log('Paused in real-time mode');
                    }
                    else {
                        console.log('Paused after point time query');
                    }
                }
                var startTime = new Date().getTime();
                var snapshotRequest = jQuery.getJSON(url);
                snapshotRequest.done((function (snapshotJSON) {
                    var time = new Date().getTime() - startTime;
                    console.log('Time to get snapshot: ' + time + 'ms');
                    var malformedSnapshot = false;
                    if ((snapshotJSON == null) || (!snapshotJSON.hasOwnProperty("@id"))) {
                        console.log("Malformed snapshot received, parsing and updating won't be launched until next valid snapshot");
                        console.log(snapshotJSON);
                        malformedSnapshot = true;
                        var snapshot = void 0;
                        var errorMsg = "Could not find DAQ snapshot with requested params";
                        if (snapshotJSON != null) {
                            if (snapshotJSON.hasOwnProperty("message")) {
                                errorMsg = snapshotJSON.message;
                            }
                        }
                        //url argument is not used in a state of error, so I use it to pass more info about the error
                        this.setSnapshot(snapshot, this.drawPausedPage, false, false, errorMsg); //maybe also pass message to setSnapshot?
                        //reset value after use
                        this.drawPausedPage = false;
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
                        //null snapshot can be caused by indefinite chain of elements in the received json
                        if (snapshot != null) {
                            //discover if data flow rate is zero
                            var drawDataFlowIsZero_1 = false;
                            var daq = snapshot.getDAQ();
                            if (daq.fedBuilderSummary.rate == 0) {
                                daq.fedBuilders.forEach(function (fedBuilder) {
                                    if (fedBuilder.ru != null && fedBuilder.ru.isEVM) {
                                        if (fedBuilder.ru.stateName === "Enabled") {
                                            drawDataFlowIsZero_1 = true;
                                        }
                                    }
                                });
                            }
                            //discover if snapshot is stale
                            var drawStaleSnapshot = false;
                            var dataTime = new Date(daq.lastUpdate).getTime();
                            this.snapshotSource.currentSnapshotTimestamp = dataTime;
                            var serverResponseTime = new Date(snapshotRequest.getResponseHeader("Date")).getTime();
                            var diff = serverResponseTime - dataTime;
                            var thres = 15000; //in ms
                            console.log("Time diff between snapshot timestamp and response (in ms): " + diff);
                            if ((diff > thres)) {
                                drawStaleSnapshot = true;
                            }
                            else {
                                drawStaleSnapshot = false;
                            }
                            //updates daqview url
                            var localTimestampElements = (new Date(snapshot.getUpdateTimestamp()).toString()).split(" ");
                            //keep Month, Day, Year, Time (discard Weekday and timezone info)
                            var formattedLocalTimestamp = localTimestampElements[3] + "-" + this.mapOfMonths[localTimestampElements[1]] + "-" + localTimestampElements[2] + "-" + localTimestampElements[4];
                            window.history.replaceState(null, null, "?setup=" + this.snapshotSource.getRequestSetup() + "&time=" + formattedLocalTimestamp);
                            document.title = "DAQView [" + formattedLocalTimestamp + "]";
                            //updates url to retrieve snapshot
                            //in case of point time queries (eg. after pause or goto-time command, the time is already appended in the URL)
                            var urlToSnapshot = url.indexOf("time") > -1 ? url : url + "&time=\"" + (new Date(snapshot.getUpdateTimestamp()).toISOString()) + "\"";
                            //pass info before setting snapshot and rendering (this passes the same set of info to all elements)
                            var args = [];
                            args.push(this.snapshotSource.runInfoTimelineLink());
                            this.prePassElementSpecificData(args);
                            console.log("drawPaused@provider? " + this.drawPausedPage);
                            this.setSnapshot(snapshot, this.drawPausedPage, drawDataFlowIsZero_1, drawStaleSnapshot, urlToSnapshot); //passes snapshot source url to be used for the "see raw snapshot" button
                            //in case there is a parsed snapshot, update pointer to previous snapshot with the more precise timestamp retrieved by the snapshot itself
                            this.previousUrl = url + "&time=\"" + (new Date(snapshot.getUpdateTimestamp()).toISOString()) + "\"";
                        }
                        else {
                            console.log("DAQView was unable to parse snapshot...");
                            console.log(snapshotJSON);
                            this.setSnapshot(snapshot, this.drawPausedPage, false, false, "Could not parse DAQ snapshot");
                        }
                        //reset value after use
                        this.drawPausedPage = false;
                        time = new Date().getTime() - startTime;
                        console.log('Time to update page: ' + time + 'ms');
                    }
                    setTimeout(updateFunction, this.snapshotSource.updateInterval);
                }).bind(this));
                snapshotRequest.fail((function () {
                    console.log("Error in remote snapshot request, retrying after " + this.snapshotSource.updateInterval + " millis");
                    var snapshot;
                    this.setSnapshot(snapshot, this.drawPausedPage, false, false, "Could not reach server for snapshots");
                    //reset value after use
                    this.drawPausedPage = false;
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
