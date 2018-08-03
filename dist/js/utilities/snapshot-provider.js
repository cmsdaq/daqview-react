"use strict";
/**
 * @author Michail Vougioukas
 * @author Philipp Brummer
 */
var DAQAggregator;
(function (DAQAggregator) {
    class SnapshotProvider {
        constructor(snapshotSource) {
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
        addView(view) {
            this.views.push(view);
        }
        prePassElementSpecificData(args) {
            this.views.forEach(view => view.prePassElementSpecificData(args));
        }
        setSnapshot(snapshot, drawPausedPage, drawZeroDataFlowComponent, drawStaleSnapshot) {
            this.views.forEach(view => view.setSnapshot(snapshot, drawPausedPage, drawZeroDataFlowComponent, drawStaleSnapshot));
        }
        isRunning() {
            return this.running;
        }
        isInRealTimePolling() {
            return this.inRealTimePolling;
        }
        start() {
            console.log(("Snapshot provided start() at: " + new Date().toISOString()));
            if (this.running) {
                return;
            }
            this.running = true;
            let updateFunction = (function () {
                if (!this.running) {
                    return;
                }
                //retrieves previous url for local use, before updating its value is updated
                let previousUrlTemp = this.previousUrl;
                let url = this.snapshotSource.getSourceURL(); //url to snapshot source, not to daqview (must be compatible with server's expected format)
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
                let startTime = new Date().getTime();
                let snapshotRequest = jQuery.getJSON(url);
                snapshotRequest.done((function (snapshotJSON) {
                    let time = new Date().getTime() - startTime;
                    console.log('Time to get snapshot: ' + time + 'ms');
                    let malformedSnapshot = false;
                    if ((snapshotJSON == null) || (!snapshotJSON.hasOwnProperty("@id"))) {
                        console.log("Malformed snapshot received, parsing and updating won't be launched until next valid snapshot");
                        console.log(snapshotJSON);
                        malformedSnapshot = true;
                        let snapshot;
                        let errorMsg = "Could not find DAQ snapshot with requested params";
                        if (snapshotJSON != null) {
                            if (snapshotJSON.hasOwnProperty("message")) {
                                errorMsg = snapshotJSON.message;
                            }
                        }
                        console.error(errorMsg);
                        this.setSnapshot(snapshot, this.drawPausedPage, false, false); //maybe also pass message to setSnapshot?
                        //reset value after use
                        this.drawPausedPage = false;
                    }
                    if (!malformedSnapshot) {
                        let snapshot;
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
                            let drawDataFlowIsZero = false;
                            let daq = snapshot.getDAQ();
                            if (daq.fedBuilderSummary.rate == 0) {
                                daq.fedBuilders.forEach(function (fedBuilder) {
                                    if (fedBuilder.ru != null && fedBuilder.ru.isEVM) {
                                        if (fedBuilder.ru.stateName === "Enabled") {
                                            drawDataFlowIsZero = true;
                                        }
                                    }
                                });
                            }
                            //discover if snapshot is stale
                            let drawStaleSnapshot = false;
                            let dataTime = new Date(daq.lastUpdate).getTime();
                            this.snapshotSource.currentSnapshotTimestamp = dataTime;
                            let serverResponseTime = new Date(snapshotRequest.getResponseHeader("Date")).getTime();
                            let diff = serverResponseTime - dataTime;
                            let thres = 15000; //in ms
                            console.log("Time diff between snapshot timestamp and response (in ms): " + diff);
                            if ((diff > thres)) {
                                drawStaleSnapshot = true;
                            }
                            else {
                                drawStaleSnapshot = false;
                            }
                            //updates daqview url
                            let localTimestampElements = (new Date(snapshot.getUpdateTimestamp()).toString()).split(" ");
                            //keep Month, Day, Year, Time (discard Weekday and timezone info)
                            let formattedLocalTimestamp = localTimestampElements[3] + "-" + this.mapOfMonths[localTimestampElements[1]] + "-" + localTimestampElements[2] + "-" + localTimestampElements[4];
                            let currentUrl = document.location.href;
                            let urlToUpdate = currentUrl.indexOf("?") > -1 ? currentUrl.substr(0, currentUrl.indexOf("?")) : currentUrl;
                            let query = "setup=" + this.snapshotSource.getRequestSetup() + "&time=" + formattedLocalTimestamp;
                            urlToUpdate = urlToUpdate + "?" + query;
                            console.log("new URL : " + urlToUpdate);
                            DAQViewGUIUtility.setSharableLink(urlToUpdate);
                            //window.history.replaceState(null, null, "?setup=" + this.snapshotSource.getRequestSetup() + "&time=" + formattedLocalTimestamp);
                            document.title = "DAQView [" + formattedLocalTimestamp + "]";
                            //updates url to retrieve snapshot
                            //in case of point time queries (eg. after pause or goto-time command, the time is already appended in the URL)
                            let urlToSnapshot = url.indexOf("time") > -1 ? url : url + "&time=\"" + (new Date(snapshot.getUpdateTimestamp()).toISOString()) + "\"";
                            //pass info before setting snapshot and rendering (this passes the same set of info to all elements)
                            let args = [];
                            args.push(this.snapshotSource.runInfoTimelineLink());
                            this.prePassElementSpecificData(args);
                            console.log("drawPaused@provider? " + this.drawPausedPage);
                            this.setSnapshot(snapshot, this.drawPausedPage, drawDataFlowIsZero, drawStaleSnapshot);
                            //in case there is a parsed snapshot, update pointer to previous snapshot with the more precise timestamp retrieved by the snapshot itself
                            this.previousUrl = url + "&time=\"" + (new Date(snapshot.getUpdateTimestamp()).toISOString()) + "\"";
                        }
                        else {
                            console.error("DAQView was unable to parse snapshot...");
                            console.log(snapshotJSON);
                            this.setSnapshot(snapshot, this.drawPausedPage, false, false);
                        }
                        //reset value after use
                        this.drawPausedPage = false;
                        time = new Date().getTime() - startTime;
                        console.log('Time to update page: ' + time + 'ms');
                    }
                    setTimeout(updateFunction, this.snapshotSource.updateInterval);
                }).bind(this));
                snapshotRequest.fail((function () {
                    console.error("Error in remote snapshot request, retrying after " + this.snapshotSource.updateInterval + " millis");
                    let snapshot;
                    this.setSnapshot(snapshot, this.drawPausedPage, false, false);
                    //reset value after use
                    this.drawPausedPage = false;
                    setTimeout(updateFunction, this.snapshotSource.updateInterval);
                }).bind(this));
            }).bind(this);
            setTimeout(updateFunction, this.snapshotSource.updateInterval);
        }
        //this method will immediately stop page updating (including both values and graphics)
        stop() {
            this.running = false;
        }
        switchToRealTime() {
            this.inRealTimePolling = true;
        }
        switchToGotoTimeRequests() {
            this.inRealTimePolling = false;
        }
        /*arg 0 if called from a real time updating context, arg 1 if called from a go-to-time-and-pause context*/
        provideOneMoreSnapshotAndStop(callerType) {
            this.pauseCallerType = callerType;
            this.instructionToStop = true;
        }
    }
    DAQAggregator.SnapshotProvider = SnapshotProvider;
})(DAQAggregator || (DAQAggregator = {}));
