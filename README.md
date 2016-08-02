# DAQ View React Prototype

## Todo
- [ ] comment TypeScript code
- [x] implement sorting on all FFF table columns
- [ ] add styles to FB table
- [ ] implement sorting of FB table (default order by TTCP name, option to order by any RU column, maybe TTS state) 
- [ ] complete display of FEDs in the FB table
  - [ ] correctly find and distribute dependent FEDs
- [ ] display FED errors in RU warn column of FB table
- [ ] add header view to display snapshot metadata and system status (timestamp, DPSet path, last run start, run numbber, session id)
- [ ] add page-wide styles and/or notifications to draw the shifter's attention to a problem
- [x] rewrite parser to match the new snapshot format
- [ ] add navigation options (display snapshot by run, session, time, next/previous snapshot) => requires server-side API
- [ ] add expert option to display additional data from the snapshot
