# DAQ View React

## Introduction

A client-side implementation of the daqview monitoring application for the CMS DAQ FED Builder and Filter Farm infrastructure.

Data is provided by the DAQ Aggregator in the form of JSON snapshots.

React.js is used for processing and rendering monitoring information on the client, without the need of server-side logic.

## Development

### Minimal Requirements

- NodeJS version 6
- NPM version 3
- TypeScript version 2

### Setup

1. Install nodejs and npm

2. Install dependencies: (in project root)
```
npm install
```
or
```
npm install --only=dev
```

## Compilation

With npm: (in project root)
```
npm run build
```

## Release (based on the version attribute in package.json)

With npm: (in project root)
```
npm run release
```

## Linting

With npm: (in project root)
```
npm run lint
```