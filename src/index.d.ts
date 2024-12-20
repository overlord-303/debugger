// index.d.ts
// noinspection JSUnusedGlobalSymbols

declare module 'debugger-logger'
{
    import * as Module from "node:module";
    import * as Util from "debugger-logger/src/Util";
    import * as MainError from "debugger-logger/src/MainError";
    import * as toJSON from "debugger-logger/src/ToJSON";
    import { HRI, ModuleBackupType } from "debugger-logger/src/HttpRequestInterceptor";

    enum EventTypes {
        'filelog',
        'consolelog',
        'modulecall',
    }

    type EnvironmentInformation = {
        name: string,
        version: string,
        platform: NodeJS.Platform,
        architecture: NodeJS.Architecture,
        nodePath: string,
        pid: number
    }

    type MemorySnapshotEntry = {
        bytes: number,
        kilobytes: number,
        megabytes: number
    }

    type MemorySnapshot = { [key in keyof NodeJS.MemoryUsage]: MemorySnapshotEntry };

    type EventArgs = {
        filelog: [string, string],
        consolelog: [string, string],
        modulecall: [string, string, string],
    }

    type EventCallback<T extends keyof EventArgs> = (...args: EventArgs[T]) => void;

    /**
     * Debugger class *(currently)* used for logging in a Node.js environment.
     * It provides methods to log module calls, messages, errors, and debug information to the console and log files.
     */
    class Debugger
    {
        EVENTS: { [key in keyof typeof EventTypes as Uppercase<key & string>]: EventTypes[key] } = {};

        #ORIGINAL_LOGS: { [key: string]: (...args: function[]) => void };
        #ORIGINAL_MODULE_FUNCTIONALITY: {
            load: Module._load,
            compile: Module.prototype._compile,
        };

        #stack: string;
        #throwError: boolean;

        #startTime: number;
        #isEventTriggeredLog: boolean;
        #debug: boolean;

        #LOG_DIRECTORY: string;
        #LOG_LEVEL: {
            TYPE_INFO: string;
            TYPE_DEBUG: string;
            TYPE_ERROR: string;
            TYPE_WARNING: string;
            TYPE_TRACEBACK: string;
        };
        #UTIL: {
            getDateTime: () => string;
            getDate: () => string;
            getExecutionTime: () => string;
            getClass: () => string;
            isNode: () => boolean;
            hasKey: (data: any[]) => boolean;
            stacktrace: (stacktrace: string, maxEntries?: number) => string[];
        };
        #EVENTS: { [key in keyof typeof EventTypes]?: EventCallback<keyof EventArgs>[]} = {}

        /**
         * @throws MainError
         * @see getSingletonInstance
         */
        constructor();

        /**
         * Static {@link HRI} instance.
         */
        static #HRI: HRI;

        /**
         * Global {@link Debugger} instance.
         */
        static #instance: Debugger;

        /**
         * Get the global {@link Debugger} instance.
         */
        static getSingletonInstance(): Debugger;

        /**
         * @param {boolean} debug Flag indicating whether debug-mode is active
         */
        setDebug(debug: boolean): void;

        /**
         * Set path to the *Logs*-Directory.
         * @param {string} dirPath
         */
        setLogDirectoryPath(dirPath: string): void;

        /**
         * Get env-information and current execution time.
         */
        getData(): {
            env: EnvironmentInformation;
            memoryUsage: MemorySnapshot;
            executionTimePassed: string;
        };

        /**
         * Restore modules back to their original state.
         *
         * @see {@link ModuleBackupType}
         */
        restore(_moduleName: keyof typeof ModuleBackupType): void;

        /**
         * Check if a passed error is an instance of {@link MainError}.
         */
        isMainError(_error: Error): boolean;
        isMainError(..._errors: Error[]): boolean[];

        /**
         * Add a listener to a chosen event.
         */
        on<T extends typeof EventTypes | keyof typeof EventTypes>(event: T, listener: EventCallback<T>): void;

        /**
         * Remove a listener for a chosen event.
         */
        off<T extends typeof EventTypes | keyof typeof EventTypes>(event: T, listener: EventCallback<T>): void;

        /**
         * Emit an event with it's required parameters.
         * @emits {@link EventTypes}
         */
        #emit<T extends typeof EventTypes | keyof typeof EventTypes>(event: T, ...args: EventArgs[T]): void;

        /**
         * Get the {@link EnvironmentInformation} formatted as a string for logging purposes.
         */
        #logData(): string;

        /**
         * Register shutdown functions.
         */
        #setShutdownFunction(): void;

        /**
         * Register global error handler.
         */
        #setGlobalErrorHandler(): void;

        /**
         * Overrides console functions for logging purposes.
         */
        #overrideConsoleFunctionality(): void;

        /**
         * Overrides module loader and compiler functionality for logging purposes.
         * @emits {@link EventTypes.modulecall}
         */
        #overrideModuleLoaderFunctionality(): void;

        /**
         * Formats all keys on an object into strings.
         */
        #format(..._data: any[]): string[];

        /**
         * Writes to the current file.
         * @emits {@link EventTypes.filelog}
         */
        #writeFile(_data: string): void;

        /**
         * Writes to the console per respective function.
         * @emits {@link EventTypes.consolelog}
         */
        #writeConsole(_calledByConsoleFunctions: string, _data: string, _emit: boolean = true): void;

        /**
         * Checks whether a string is connected to an original console function.
         */
        #isOriginalFunction(_name: string): boolean;

        /**
         * Formats and returns the Object provided by {@link NodeJS.MemoryUsage 'process.memoryUsage()'}.
         */
        #formatMemoryUsage(_memoryUsage: NodeJS.MemoryUsage): MemorySnapshot;

        /**
         * Log data (*info*) to the current *.log*-file.
         * @emits {@link EventTypes}
         */
        log(..._data: any[]): void;

        /**
         * Log data (*debug*) to the current *.log*-file.
         * @emits {@link EventTypes}
         */
        logDebug(..._data: any[]): void;

        /**
         * Log data (*error*) to the current *.log*-file.
         * @emits {@link EventTypes}
         */
        logError(..._data: (string | Error)[]): void;

        /**
         * Logs a given data string to the file and if called by {@link console} also logs it per that function.
         * @emits {@link EventTypes}
         */
        #log(_type: string, _data: string, _calledByConsoleFunctions: false|string): void
    }

    const D: Debugger;

    export = D;
}
