/**
 * @author Michail Vougioukas
 * @author Philipp Brummer
 */

namespace DAQAggregator {

    import DAQSnapshotView = DAQView.DAQSnapshotView;
    import DAQAggregatorSnapshot = DAQAggregator.Snapshot;
    import DAQ = DAQAggregator.Snapshot.DAQ;

    export class SnapshotProvider implements DAQSnapshotView {
        private snapshotSource: SnapshotSource;
        private running: boolean = false;
        private inRealTimePolling: boolean = true;
        private instructionToStop:boolean = false;
        private drawPausedPage: boolean = false;
        private previousUrl: string = "";
        private pauseCallerType: number = 0; //by default all pause calls are asssumed to be originated from the real time mode

        private views: DAQSnapshotView[] = [];

        constructor(snapshotSource: SnapshotSource) {
            this.snapshotSource = snapshotSource;
        }

        public addView(view: DAQSnapshotView) {
            this.views.push(view);
        }

        public setSnapshot(snapshot: Snapshot, drawPausedPage: boolean, drawZeroDataFlowComponent:boolean, url: string) {

            this.views.forEach(view => view.setSnapshot(snapshot, drawPausedPage, drawZeroDataFlowComponent, url));
        }

        public isRunning(): boolean {
            return this.running;
        }

        public isInRealTimePolling(): boolean {
            return this.inRealTimePolling;
        }

        public start() {
            console.log(("Snapshot provided start() at: "+new Date().toISOString()));

            if (this.running) {
                return;
            }
            this.running = true;

            let updateFunction: () => void = (function () {
                if (!this.running) {
                    return;
                }

                //retrieves previous url for local use, before updating its value is updated
                let previousUrlTemp: string = this.previousUrl;

                let url: string = this.snapshotSource.getSourceURL(); //url to snapshot source, not to daqview (must be compatible with server's expected format)

                if (!this.inRealTimePolling){
                    url = this.snapshotSource.getSourceURLForGotoRequests();
                    console.log('In go-to-time snapshot provider mode');
                }else{
                    console.log('In real-time snapshot provider mode');
                }

                //updates global previousUrl holder with this call's url and current timestamp (only to be used with possible subsequent go-to-time request)
                this.previousUrl = url+"&time=\""+(new Date().toISOString())+"\""; //quotes for server url compatibility


                //at this point, this will stop the provider after completing the current snapshot request and daqview update
                if (this.instructionToStop){
                    console.log('Instructed to stop');
                    this.stop();
                    this.instructionToStop = false; //reset value immediately: it only needs to be true once and then be clean for later usages of the method
                    this.drawPausedPage = true; //triggers page draw with pause color scheme

                    /*retain previous snapshot if instruction to stop has been called from real-time mode,
                     otherwise draw requested snaphost if instruction to stop is a result of a go-to-time request*/
                    if (this.pauseCallerType == 0){
                        url = previousUrlTemp;
                        console.log('Paused in real-time mode');
                    }else{
                        console.log('Paused after point time query');
                    }
                }


                let startTime: number = new Date().getTime();
                let snapshotRequest = jQuery.getJSON(url);

                snapshotRequest.done((function (snapshotJSON: any) {
                    let time: number = new Date().getTime() - startTime;
                    console.log('Time to get snapshot: ' + time + 'ms');

                    let malformedSnapshot: boolean = false;

                    if ((snapshotJSON == null)||(!snapshotJSON.hasOwnProperty("@id"))){
                        console.log("Malformed snapshot received, parsing and updating won't be launched until next valid snapshot");
                        console.log(snapshotJSON);
                        malformedSnapshot = true;
                        let snapshot: Snapshot;

                        let errorMsg: string = "Could not find DAQ snapshot with requested params";
                        if (snapshotJSON.hasOwnProperty("message")){
                            errorMsg = snapshotJSON.message;
                        }

                        //url argument is not used in a state of error, so I use it to pass more info about the error
                        this.setSnapshot(snapshot, this.drawPausedPage, false, errorMsg); //maybe also pass message to setSnapshot?
                        //reset value after use
                        this.drawPausedPage = false;
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

                        //null snapshot can be caused by indefinite chain of elements in the received json
                        if (snapshot != null) {

                            //discover if data flow rate is zero
                            let drawDataFlowIsZero: boolean = false;

                            let daq: DAQAggregatorSnapshot.DAQ = snapshot.getDAQ();
                            if (daq.fedBuilderSummary.rate == 0) {
                                daq.fedBuilders.forEach(function (fedBuilder) {
                                    if (fedBuilder.ru != null && fedBuilder.ru.isEVM) {
                                        if (fedBuilder.ru.stateName === "Enabled") {
                                            drawDataFlowIsZero = true;
                                        }
                                    }
                                });
                            }


                            //updates daqview url
                            window.history.replaceState(null, null, "?setup=" + this.snapshotSource.getRequestSetup() + "&time=" + (new Date(snapshot.getUpdateTimestamp()).toISOString()));
                            document.title = "DAQView [" + (new Date(snapshot.getUpdateTimestamp()).toISOString()) + "]";

                            //in case of point time queries (eg. after pause or goto-time command, the time is already appended in the URL)
                            let urlToSnapshot: string = url.indexOf("time") > -1 ? url : url + "&time=\"" + (new Date(snapshot.getUpdateTimestamp()).toISOString()) + "\"";

                            console.log("drawPaused@provider? " + this.drawPausedPage);
                            this.setSnapshot(snapshot, this.drawPausedPage, drawDataFlowIsZero, urlToSnapshot); //passes snapshot source url to be used for the "see raw snapshot" button

                            //in case there is a parsed snapshot, update pointer to previous snapshot with the more precise timestamp retrieved by the snapshot itself
                            this.previousUrl = url + "&time=\"" + (new Date(snapshot.getUpdateTimestamp()).toISOString()) + "\"";

                        }else{
                            console.log("DAQView was unable to parse snapshot...");
                            console.log(snapshotJSON);
                            this.setSnapshot(snapshot, this.drawPausedPage, false, "Could not parse DAQ snapshot");
                        }

                        //reset value after use
                        this.drawPausedPage = false;

                        time = new Date().getTime() - startTime;
                        console.log('Time to update page: ' + time + 'ms');

                    }

                    setTimeout(updateFunction, this.snapshotSource.updateInterval);
                }).bind(this));

                snapshotRequest.fail((function (){
                    console.log("Error in remote snapshot request, retrying after "+this.snapshotSource.updateInterval+" millis");
                    let snapshot: Snapshot;
                    this.setSnapshot(snapshot, this.drawPausedPage, false, "Could not reach server for snapshots");
                    //reset value after use
                    this.drawPausedPage = false;
                    setTimeout(updateFunction, this.snapshotSource.updateInterval);
                }).bind(this));

            }).bind(this);


            setTimeout(updateFunction, this.snapshotSource.updateInterval);
        }

//this method will immediately stop page updating (including both values and graphics)
        public stop() {
            this.running = false;
        }

        public switchToRealTime(){
            this.inRealTimePolling = true;
        }

        public switchToGotoTimeRequests(){
            this.inRealTimePolling = false;
        }

        /*arg 0 if called from a real time updating context, arg 1 if called from a go-to-time-and-pause context*/
        public provideOneMoreSnapshotAndStop(callerType: number){
            this.pauseCallerType = callerType;
            this.instructionToStop = true;
        }

        public checkIfDataFlowIsStopped(snapshot: Snapshot): boolean{
            let daq: DAQAggregatorSnapshot.DAQ = snapshot.getDAQ();
            if (daq.fedBuilderSummary.rate>0){
                return false;
            }
            daq.fedBuilders.forEach(function (fedBuilder) {
                if (fedBuilder.ru != null && fedBuilder.ru.isEVM) {
                    if (fedBuilder.ru.stateName === "Enabled") {
                        return true;
                    }
                }
            });
            return false;
        }
    }

}