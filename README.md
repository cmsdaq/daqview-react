# DAQ View React

## Introduction

An implementation of client-side daqview monitoring application for the CMS DAQ FED Builder and Filter-Based Filter Farm infrastructure.

Data are provided by the DAQ Aggregator snapshots in form of JSON files and React.js is used for processing and rendering monitoring information on the client, without any need for server-side logic.


## Todo
- [x] add and update styles {handle issue with frl enabled yet srcId is 0/check what happens with frlMasked when L0 flashlist is unavailable => takes DAQAggregator debugging}
- [x] handle special cases at %W, %B TTCP columns, as done in the P,A,F columns => possibly requires DAQAggregator changes
- [x] more resolution to the value of #frags in RU col at FEDBuilder summary
- [ ] move FED errors from RU warn column into the FED space
- [ ] add clever polling in snapshot provider => requires support from the API
- [x] add additional information (beam mode etc.)
- [ ] when paused, page-wide colour change should occur to attract shifter's attention
- [ ] add page-wide styles and/or notifications to draw the shifter's attention to a problem
- [x] add navigation option by time
- [ ] add other navigation options (display snapshot by run, session, time, next/previous snapshot) => requires server-side API
- [ ] add expert option to display additional data from the snapshot

- [x] switch back to production React before deploying
