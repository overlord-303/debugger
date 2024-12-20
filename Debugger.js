const MainError = require('./src/MainError.js');
const Util = require('./src/Util.js');
const toJSON = require('./src/ToJSON.js');

const Module = require('module');
const path = require('path');
const { writeFileSync, existsSync, mkdirSync } = require('fs');

class Debugger
{
    EVENTS = {
        FILELOG: 'filelog',
        CONSOLELOG: 'consolelog',
        MODULECALL: 'modulecall',
    };

    #ORIGINAL_LOGS;
    #ORIGINAL_MODULE_FUNCTIONALITY;

    #stack = function getStack() { const obj = {}; Error.captureStackTrace(obj, getStack); return obj.stack; }();
    #throwError = (Debugger.#instance || !this.#stack.includes('Debugger.getSingletonInstance') || !(this.#stack.includes('Debugger.getSingletonInstance') && this.#stack.includes('new Debugger')));

    #startTime = performance.now();
    #lastLogTime = 0;
    #isEventTriggeredLog = false;
    #debug = false;

    #LOG_DIRECTORY = path.join(path.dirname(require.main?.filename || process.cwd()), 'Logs/');
    #LOG_LEVEL = {
        TYPE_INFO: 'info',
        TYPE_DEBUG: 'debug',
        TYPE_ERROR: 'error',
        TYPE_WARNING: 'warning',
        TYPE_TRACEBACK: 'traceback',
    };
    #UTIL = {
        getDateTime: () =>
        {
            const now = new Date();

            const year = now.getFullYear();
            const month = String(now.getMonth() + 1).padStart(2, '0');
            const day = String(now.getDate()).padStart(2, '0');

            const hours = String(now.getHours()).padStart(2, '0');
            const minutes = String(now.getMinutes()).padStart(2, '0');
            const seconds = String(now.getSeconds()).padStart(2, '0');

            return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
        },
        getDate: () => {
            const now = new Date();

            const year = now.getFullYear();
            const month = String(now.getMonth() + 1).padStart(2, '0');
            const day = String(now.getDate()).padStart(2, '0');

            return `${year}-${month}-${day}`;
        },
        getExecutionTime: () =>
        {
            const endTime = performance.now();
            const duration = (endTime - this.#startTime) / 1000; // Convert milliseconds to seconds
            return duration.toFixed(3); // Round to 3 decimal places
        },
        getLogDifference: () =>
        {
            const now = performance.now();
            !this.#lastLogTime ? this.#lastLogTime = now : void 0;
            const difference =  now - this.#lastLogTime;
            this.#lastLogTime = now;
            return difference.toFixed(0);
        },
        getClass: () => this.constructor.name,
        isNode: () => typeof global !== 'undefined' && global.process != null && global.process.versions != null && global.process.versions.node != null,
        hasKey: (data) => data.length > 0 ? this.#ORIGINAL_LOGS.hasOwnProperty(data[0]) : false,
        stacktrace: MainError.getStacktraceFormatter(),
    }
    #EVENTS = {};

    /**
     * @see getSingletonInstance
     */
    constructor()
    {
        if (this.#throwError) throw MainError.fromErrorCode('DLE5001').addData({ stack: this.#stack });

        this.#ORIGINAL_LOGS = {
            log: console.log,
            error: console.error,
            debug: console.debug,
            info: console.info,
            trace: console.trace,
        };
        this.#ORIGINAL_MODULE_FUNCTIONALITY = {
            load: Module._load,
            compile: Module.prototype._compile,
        };

        this.#overrideConsoleFunctionality();
        this.#overrideModuleLoaderFunctionality();
        this.#setShutdownFunction();
        this.#setGlobalErrorHandler();
    }

    static #HRI;
    static #instance;
    static getSingletonInstance()
    {
        if (!Debugger.#instance)
        {
            Debugger.#instance = new Debugger();
            Debugger.#instance.log(Debugger.#instance.#UTIL.getClass() + "::instance_created > 'Logger started'.");

            Debugger.#HRI = require('debugger-logger/src/HttpRequestInterceptor');
        }

        return Debugger.#instance;
    }

    setDebug(_debug)
    {
        typeof _debug === 'boolean'
            ? this.#debug = _debug
            : _debug;
    }

    setLogDirectoryPath(_dirPath)
    {
        typeof _dirPath === 'string'
            ? this.#LOG_DIRECTORY = path.normalize(_dirPath)
            : void 0;
    }

    getData()
    {
        return {
            env: {
                name: "Node.js",
                version: process.version,
                platform: process.platform,
                architecture: process.arch,
                nodePath: process.execPath,
                pid: process.pid,
            },
            memoryUsage: this.#formatMemoryUsage(process.memoryUsage()),
            executionTimePassed: this.#UTIL.getExecutionTime(),
        };
    }

    restore(_moduleName)
    {
        Debugger.#HRI.restore(_moduleName);
    }

    isMainError(..._errors)
    {
        if (_errors.length === 1) return _errors[0] instanceof MainError;
        else return _errors.map(error => error instanceof MainError);
    }

    on(_event, _listener)
    {
        if (!this.#EVENTS[_event]) this.#EVENTS[_event] = [];

        this.#EVENTS[_event].push(_listener);
    }

    off(_event, _listener)
    {
        if (!this.#EVENTS[_event]) return;

        this.#EVENTS[_event] = this.#EVENTS[_event].filter(listener => listener !== _listener);
    }

    #emit(_event, ...args)
    {
        if (!this.#EVENTS[_event]) return;

        this.#EVENTS[_event].forEach(listener =>
        {
            this.#isEventTriggeredLog = true;
            listener(...args);
            this.#isEventTriggeredLog = false;
        });
    }

    #logData()
    {
        return Object.values(this.getData().env).join(', ');
    }

    #setShutdownFunction()
    {
        const callback = (code) =>
        {
            const className = this.#UTIL.getClass();

            if (this.#debug) this.log(`ENV::information > '${this.#logData()}'.`);

            this.log(`${className}::script_exit > ${this.#UTIL.getExecutionTime()}s.`);

            (typeof code === 'number' || typeof code === 'string')
                ? this.log(`${className}::script_exit > 'Script execution finished with code: ${code}'.\n`)
                : this.log(`${className}::script_exit > 'Script execution finished'.\n`);
        };

        process.on('exit', callback);
    }

    #setGlobalErrorHandler()
    {
        const callback = (error) => this.logError('error', error);

        process.on('uncaughtException', callback);
    }

    #overrideConsoleFunctionality()
    {
        for (let key in this.#ORIGINAL_LOGS)
        {
            const classKey = key === 'log' ? key : 'log' + (key[0].toUpperCase() + key.substring(1));

            typeof this[classKey] === 'function'
                ? console[key] = (...args) => this[classKey].bind(this)(key, ...args)
                : console[key];
        }
    }

    #overrideModuleLoaderFunctionality()
    {
        const emitter = this.#emit.bind(this);
        const loader = this.#ORIGINAL_MODULE_FUNCTIONALITY.load;
        const compiler = this.#ORIGINAL_MODULE_FUNCTIONALITY.compile;

        const parentInfo = (_parent, _request) =>
        {
            let _parentId = _parent && _parent.id ? _parent.id : process.cwd();

            let resolvedRequest;

            if (_request.startsWith('.') || _request.startsWith('/')) resolvedRequest = path.resolve(path.dirname(_parentId), _request);
            else resolvedRequest = _request;

            const rootDir = process.cwd();
            const unparsedParentId = path.relative(rootDir, _parentId) || 'root';
            const requestId = path.relative(rootDir, resolvedRequest) || _request;

            const parsedParentId = path.parse(unparsedParentId);
            const parentId = `${parsedParentId.dir ? parsedParentId.dir + '/' : ''}${parsedParentId.name}`;

            return { requestId, parentId };
        }

        Module._load = function(request, parent, isMain)
        {
            const { requestId, parentId } = parentInfo(parent, request);

            emitter('modulecall', 'load', parentId, requestId);
            console.debug(`${parentId}::load_module > '${requestId}'.`);

            return loader.apply(this, arguments);
        };

        Module.prototype._compile = function(content, filename)
        {
            emitter('modulecall', 'compile', filename, content);
            console.debug(`root::compile_module > '${filename}'.`);

            return compiler.call(this, content, filename);
        };
    }

    #format(..._data)
    {
        return _data.map((item) =>
        {
            if (item instanceof Error)
            {
                if (item instanceof MainError)
                {
                    return `${item.name},\n${new toJSON(item.getData())}`;
                }
                return `${new toJSON(item)}`;
            }
            else if (typeof item === "object" && item !== null)
            {
                try
                {
                    return `${new toJSON(item)}`;
                } catch (error) { return "[Circular]"; }
            }
            else if (typeof item === "function")
            {
                return item.toString();
            }
            else return String(item);
        });
    }

    #writeFile(_data)
    {
        const file = this.#LOG_DIRECTORY + this.#UTIL.getDate() + '.log';

        this.#emit('filelog', file, _data);

        writeFileSync(file, _data + '\n', { flag: 'a' });
    }

    #writeConsole(_calledByConsoleFunctions, _data, _emit = true)
    {
        if (_emit) this.#emit('consolelog', _calledByConsoleFunctions, _data);

        this.#ORIGINAL_LOGS[_calledByConsoleFunctions](_data);
    }

    #isOriginalFunction(_name)
    {
        return typeof this.#ORIGINAL_LOGS[_name] === 'function';
    }

    #formatMemoryUsage(_memoryUsage)
    {
        const convertedUsage = {};

        for (const key in _memoryUsage)
        {
            const bytes = _memoryUsage[key];
            convertedUsage[key] = {
                bytes: bytes,
                kilobytes: Number((bytes / 1024).toFixed(2)),         // KB
                megabytes: Number((bytes / (1024 * 1024)).toFixed(2)) // MB
            };
        }

        return convertedUsage;
    }

    log(..._data)
    {
        const hasKey = this.#UTIL.hasKey(_data);
        const formattedData = this.#format(..._data);

        this.#log
        (
            this.#LOG_LEVEL.TYPE_INFO,
            hasKey ? formattedData.slice(1).join(' ') : formattedData.join(' '),
            hasKey ? _data[0] : false
        );
    }

    logDebug(..._data)
    {
        const hasKey = this.#UTIL.hasKey(_data);
        const formattedData = this.#format(..._data);

        this.#log
        (
            this.#LOG_LEVEL.TYPE_DEBUG,
            hasKey ? formattedData.slice(1).join(' ') : formattedData.join(' '),
            (hasKey && this.#debug) ? _data[0] : false
        );
    }

    logError(..._data)
    {
        let err;
        const hasKey = this.#UTIL.hasKey(_data);

        for (let item of _data)
        {
            if (item instanceof Error)
            {
                err = item;
                break;
            }
        }

        const formattedData = this.#format(..._data);
        const slicedData = formattedData
            .filter(item => item !== err && (!hasKey || item !== _data[0]))
            .join(' ') || (err ? err.message : '');

        this.#log
        (
            this.#LOG_LEVEL.TYPE_ERROR,
            slicedData,
            hasKey ? _data[0] : false
        );
    }

    #log(_type, _data, _calledByConsoleFunctions)
    {
        const difference = `+${this.#UTIL.getLogDifference()}ms`;

        _calledByConsoleFunctions ? _data = `'${_data}' ${difference}` : _data = Util.appendWithTrailingNewlines(_data, difference);

        if (this.#isEventTriggeredLog && _calledByConsoleFunctions && this.#isOriginalFunction(_calledByConsoleFunctions))
            return this.#writeConsole(_calledByConsoleFunctions, _data, false);

        const dateTime = this.#UTIL.getDateTime();
        const data = `[${dateTime}] ${_type}: ${_data}`;

        if (!existsSync(this.#LOG_DIRECTORY)) mkdirSync(this.#LOG_DIRECTORY);

        this.#writeFile(data);

        _calledByConsoleFunctions
            ? this.#isOriginalFunction(_calledByConsoleFunctions)
                ? this.#writeConsole(_calledByConsoleFunctions, data)
                : void 0
            : void 0;
    }
}

module.exports = Debugger.getSingletonInstance();
