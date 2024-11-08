# Debugger Logger

**Debugger Logger** is a Node.js utility package for comprehensive logging and request interception. It provides in-depth debugging tools for Node.js applications, capturing HTTP/HTTPS requests, logging events, and managing application state through various utility methods.

## Table of Contents
- [Installation](#installation)
- [Features](#features)
    - [Logging Capabilities](#logging-capabilities)
    - [Event Handling](#event-handling)
    - [HTTP Request Interception](#http-request-interception)
    - [Environment Information](#environment-information)
    - [Custom Error Handling](#custom-error-handling)
- [Usage](#usage)
    - [Initialization](#initialization)
    - [Basic Logging](#basic-logging)
    - [Event Listeners](#event-listeners)
    - [Intercepting HTTP Requests](#intercepting-http-requests)
    - [Restoring Original Modules](#restoring-original-modules)
- [License](#license)

## Installation

To use this package, clone the repository and install dependencies if required:
```bash
git clone https://github.com/overlord-303/debugger
cd debugger
npm install
```
or install via npm:
```bash
npm install debugger-logger@latest
```

## Features

### Logging Capabilities

- **File Logging**: Saves log messages to the designated log file.
- **Console Logging**: Outputs logs to the console.
- **Module Call Logging**: Logs when a specific module is loaded, useful for tracing dependency execution.
- **Custom Log Levels**: Supports log levels such as `info`, `debug`, `error`, `warning`, and `traceback`.

### Event Handling

- Supports adding and removing listeners for custom logging events, including:
    - `filelog`: Fires on logging events to a file.
    - `consolelog`: Fires on logging events to the console.
    - `modulecall`: Fires on logging events related to module loading or compiling.

### HTTP Request Interception

- **Intercepts HTTP/HTTPS requests**: Captures outgoing HTTP and HTTPS requests, logs their details, and measures request duration.
- **Module Backup and Restoration**: Backs up original request functions (`http`/`https`) to restore the modules if needed, preventing conflicts or circular dependencies.

### Environment Information

Provides a snapshot of environment details, such as platform, architecture, Node.js version, and process ID, as well as a utility for checking execution time.

### Custom Error Handling

- Integrates global error handling for uncaught exceptions and unexpected errors.
- Allows setting custom shutdown and cleanup actions during application exit.

## Usage

### Initialization

To initialize the `Debugger` instance, import it into your main application file:
```javascript
const Debugger = require('debugger-logger');
```

The `Debugger` is a singleton and is automatically instantiated as one.

### Basic Logging

Use various log methods to track application events:
```javascript
Debugger.log('Info message');
Debugger.logDebug('Debug message');
Debugger.logError('Error message');
```

### Event Listeners

Add event listeners to track specific events:
```javascript
Debugger.on('filelog', (filePath, message) => {
    console.log(`Logged to file: ${filePath} with message: ${message}`);
});

Debugger.on('consolelog', (functionName, message) => {
    console.log(`Console function ${functionName} called with message: ${message}`);
});
```

### Intercepting HTTP Requests

Intercepted requests are logged automatically, capturing details such as:
- Request method
- Path and headers
- Status code of the response
- Duration of the request

### Restoring Original Modules

If you need to revert back to the original HTTP/HTTPS request functionality:
```javascript
Debugger.restore('http');
Debugger.restore('https');
```

### Getting environment snapshot

```javascript
Debugger.getData();
```
will return an object with the following structure:
```typescript
{
  env: {
    name: string;
    version: string;
    platform: NodeJS.Platform; 
    architecture: NodeJS.Architecture;
    nodePath: string;
    pid: number;
  };
  executionTimePassed: number;
}
```

## License

This project is licensed under the MIT License.
