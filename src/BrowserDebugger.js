const MainError = require('./MainError.js');
const { writeFileSync, existsSync, mkdirSync } = require('fs'); // ------> doesn't work in browser, needs to be fixed <------ \\
const path = require('path'); // ------> doesn't work in browser, needs to be fixed <------ \\

class BrowserDebugger
{
    #ORIGINAL_LOGS;
    #stack = function getStack() { const obj = {}; Error.captureStackTrace(obj, getStack); return obj.stack; }();
    #throwError = (BrowserDebugger.#instance || !this.#stack.includes('BrowserDebugger.getSingletonInstance') || !(this.#stack.includes('BrowserDebugger.getSingletonInstance') && this.#stack.includes('new BrowserDebugger'))); // ------> doesn't work in browser, needs to be fixed <------ \\

    #startTime = performance.now();

    #LOG_DIRECTORY = path.join(path.dirname(require.main?.filename || process.cwd()), 'Logs/'); // ------> doesn't work in browser, needs to be fixed <------ \\
    #LOG_LEVEL = {
        TYPE_INFO: 'info',
        TYPE_DEBUG: 'debug',
        TYPE_ERROR: 'error',
        TYPE_WARNING: 'warning',
        TYPE_TRACEBACK: 'traceback',
    };
    #DEBUG = false;

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
        getExecutionTime: () => // ------> doesn't work in browser, needs to be fixed <------ \\
        {
            const endTime = performance.now();
            const duration = (endTime - this.#startTime) / 1000; // Convert milliseconds to seconds
            return duration.toFixed(3); // Round to 3 decimal places
        },
        getClass: () => this.constructor.name,
        isNode: () => typeof global !== 'undefined' && global.process != null && global.process.versions != null && global.process.versions.node != null,
        hasKey: (data) => data.length > 0 ? this.#ORIGINAL_LOGS.hasOwnProperty(data[0]) : false,
    }

    /**
     * @see getSingletonInstance
     */
    constructor()
    {
        if (this.#throwError) throw new MainError('SingletonError', 'Instance already exists.');

        this.#ORIGINAL_LOGS = {
            log: console.log,
            error: console.error,
            debug: console.debug,
            info: console.info,
            trace: console.trace,
        };

        this.#overrideConsoleFunctionality();
        this.#setShutdownFunction();
        this.#setGlobalErrorHandler();
    }

    static #instance;
    static getSingletonInstance()
    {
        if (!BrowserDebugger.#instance)
        {
            BrowserDebugger.#instance = new BrowserDebugger();
            BrowserDebugger.#instance.log(BrowserDebugger.#instance.#UTIL.getClass() + '::instance_created > Logger started.');
        }

        return BrowserDebugger.#instance;
    }

    /**
     * @param {boolean} debug
     */
    setDebug(debug)
    {
        typeof debug === 'boolean' ? this.#DEBUG = debug : debug;
    }

    /**
     * @param {string} filePath
     */
    setFilePath(filePath)
    {
        typeof filePath === 'string' ?
            this.#LOG_DIRECTORY = path.normalize(filePath)
            : void 0;
    }

    /**
     * @return {env: string, env}
     */
    getData()
    {
        return {
            env: global.navigator.userAgentData.brands[1].brand,
        };
    }

    #setShutdownFunction()
    {
        const callback = (code) =>
        {
            const className = this.#UTIL.getClass();

            this.log(`${className}::script_exit > ${this.#UTIL.getExecutionTime()}s.`);

            typeof code === 'number'
                ? this.log(`${className}::script_exit > Script execution finished with code: ${code}.\n`)
                : this.log(`${className}::script_exit > Script execution finished.\n`);
        };

        this.#UTIL.isNode()
            ? global.process.on('exit', callback)
            : global.window.addEventListener('beforeunload', callback);
    }

    #setGlobalErrorHandler()
    {
        const callback = (error) => this.logError('error', error);

        this.#UTIL.isNode()
            ? global.process.on('uncaughtException', callback)
            : global.window.addEventListener('error', (event) => {
                callback(event.error || event.message);
                event.preventDefault();
            });
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

    /**
     *
     * @param {...string} _data
     */
    log(..._data)
    {
        const hasKey = this.#UTIL.hasKey(_data);

        this.#log
        (
            this.#LOG_LEVEL.TYPE_INFO,
            hasKey ? _data.slice(1).join(' ') : _data.join(' '),
            hasKey ? _data[0] : false
        );
    }

    /**
     *
     * @param {...string} _data
     */
    logDebug(..._data)
    {
        const hasKey = this.#UTIL.hasKey(_data);

        this.#log
        (
            this.#LOG_LEVEL.TYPE_DEBUG,
            hasKey ? _data.slice(1).join(' ') : _data.join(' '),
            (hasKey && this.#DEBUG) ? _data[0] : false
        );
    }

    /**
     * TODO: Implement good error handling and structure for logging as in PHP example at L-237+.
     *
     * @param {...string|Error} _data
     */
    logError(..._data)
    {
        let err;
        const hasKey = this.#UTIL.hasKey(_data);
        const hasError = (() => {
            if (!hasKey && _data[0] instanceof Error) { err = _data[0]; return true; }
            else if (_data[1] instanceof Error) { err = _data[1]; return true; }
            return false;
        })();

        const slicedData =
            (hasKey && hasError) ? _data.slice(2).join(' ') :
                (hasKey || hasError) ? _data.slice(1).join(' ') :
                    _data.join(' ');

        this.#ORIGINAL_LOGS['log'](err ?? '');

        this.#log
        (
            this.#LOG_LEVEL.TYPE_ERROR,
            slicedData,
            hasKey ? _data[0] : false
        );
    }

    /**
     * Logs a given data string to the file and if called by console.[FUNC] also logs it per that function.
     *
     * @param {string} _type
     * @param {string} _data
     * @param {false|string} _calledByConsoleFunctions
     */
    #log(_type, _data, _calledByConsoleFunctions)
    {
        const dateTime = this.#UTIL.getDateTime();

        const data = `[${dateTime}] ${_type}: ${_data}`;

        if (!existsSync(this.#LOG_DIRECTORY)) mkdirSync(this.#LOG_DIRECTORY); // ------> doesn't work in browser, needs to be fixed <------ \\

        writeFileSync(this.#LOG_DIRECTORY + this.#UTIL.getDate() + '.log', data + '\n', { flag: 'a' }); // ------> doesn't work in browser, needs to be fixed <------ \\

        _calledByConsoleFunctions
            ? typeof this.#ORIGINAL_LOGS[_calledByConsoleFunctions] === 'function'
                ? this.#ORIGINAL_LOGS[_calledByConsoleFunctions](data)
                : void 0
            : void 0;
    }
}

module.exports = {}//BrowserDebugger.getSingletonInstance();

/**
 *         $class = $error::class;
 *         $root = Application::getInstance()->getRoot();
 *         $errorTrace = $error->getTrace();
 *         $lastArrayKey = array_key_last($errorTrace);
 *
 *         static::log(self::TYPE_ERROR, $_data . " $class");
 *
 *         foreach ($errorTrace as $key => $value) {
 *
 *             isset($value['class']) ?: $value['class'] = 'Built-in';
 *             isset($value['type']) ?: $value['type'] = '()';
 *
 *             foreach ($value as $discriminator => $trace) {
 *                 if ($discriminator === 'file') {
 *                     $traceArray = explode(DIRECTORY_SEPARATOR.$root.DIRECTORY_SEPARATOR, $trace);
 *                     $trace = $traceArray[1];
 *                 }
 *                 else if ($discriminator === 'type') {
 *                     switch ($trace) {
 *                         case '->':
 *                             $trace = 'InstanceMethodCall';
 *                             break;
 *                         case '::':
 *                             $trace = 'StaticMethodCall';
 *                             break;
 *                         case '()':
 *                             $trace = 'MethodCall';
 *                             break;
 *                         default:
 *                             break;
 *                     }
 *                 }
 *                 static::log(self::TYPE_TRACEBACK, ($discriminator === 'file' ? "" : "\t")."$discriminator => $trace".($discriminator !== 'function' ? "" : '()'));
 *                 !($lastArrayKey > 0 && $key !== $lastArrayKey && $discriminator === array_key_last($value)) ?: static::log(self::TYPE_TRACEBACK, '');
 *             }
 */