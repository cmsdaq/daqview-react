# DAQ View React

## Introduction

An implementation of client-side daqview monitoring application for the CMS DAQ FED Builder and Filter-Based Filter Farm infrastructure.

Data are provided by the DAQ Aggregator snapshots in form of JSON files and React.js is used for processing and rendering monitoring information on the client, without any need for server-side logic.

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

## Linting

With npm: (in project root)
```
npm run lint
```