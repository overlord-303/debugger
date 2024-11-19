# Debugger Logger

**Debugger Logger** is a Node.js utility package for comprehensive logging and request interception. It provides in-depth debugging tools for Node.js applications, capturing HTTP/HTTPS requests, logging events, and managing application state through various utility methods.

---

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
- [Errors](#errors)
    - [Usage](#usage-1)
    - [Basics](#basics)
    - [Getting Data](#getting-data)
    - [Formatting](#formatting)
- [License](#license)

---

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

---
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

---

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

Add or remove event listeners to track specific events:
```javascript
function log(filePath, content) {
   console.log(`Logged to file: ${filePath}, with message: ${content}.`);
}

Debugger.on('filelog', log);
Debugger.off(Debugger.EVENTS.FILELOG, log);
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
```javascript
{
  env: {
    name: string,
    version: string,
    platform: NodeJS.Platform,
    architecture: NodeJS.Architecture,
    nodePath: string,
    pid: number
  },
  memoryUsage: {
    rss: {
      bytes: number,
      kilobytes: number,
      megabytes: number
    },
    heapTotal: {
      bytes: number,
      kilobytes: number,
      megabytes: number
    },
    heapUsed: {
      bytes: number,
      kilobytes: number,
      megabytes: number
    },
    external: {
      bytes: number,
      kilobytes: number,
      megabytes: number
    },
    arrayBuffers: {
      bytes: number,
      kilobytes: number,
      megabytes: number
    }
  },
  executionTimePassed: number
}
```

---


## Errors

### Basics

`MainError` is the primary error class used in **Debugger Logger** to encapsulate detailed error information.

Each `MainError` instance contains:

- **Name**: The name of the error.
- **Message**: An error message providing more detail/context.
- **Timestamp**: The date and time when the error occurred.
- **Stack Trace**: A formatted and parsed string of stack trace details for pinpointing the error source.

### Usage

Utility function to check if an error is a MainError instance, return value changes based on arguments passed to the function.

````javascript
Debugger.isMainError(error);              // Returns a boolean.
Debugger.isMainError(errorOne, errorTwo); // Returns an array of booleans.
````

### Getting Data

````javascript
error.getData();
````
will return an object with the following structure:
````javascript
{
    name: string,
    message: string,
    timestamp: Date,
    stack: string,
    code?: string, // Error-Code if created via static method `MainError.fromErrorCode()` or provided via `error.addData()`.
    
    ...key?: any,  // Any key-value pairs added via `error.addData()`.
}
````
<br>

````javascript
error.getStacktraceArray();
````
will return an array with the following structure:
````javascript
[
  number: {
      function?: string,
      file?: string,
      line?: number,
      column?: number,
    
      raw?: string, // If parsing fails the `raw` key is provided instead of the ones listed above.
  }
]
````

### Formatting

````javascript
error.toJSON();   // Returns a JSON formatted string useful for logging.
error.toString(); // Returns a formatted string useful for logging.
````

---

## License

This project is licensed under the [**GNU AGPLv3**](https://www.gnu.org/licenses/agpl-3.0.en.html) License.

---

<sup>[Back to the top](#debugger-logger)</sup>