const errors = require('./misc/errors.js');
const { getFormattedStackTrace } = require('./misc/stacktrace.js');

/**
 * @inheritDoc
 */
class MainError extends Error
{
    #name;
    #message;
    #timestamp;
    #stacktrace;

    #data = {};
    #args = [];

    constructor(name, message)
    {
        super(message);
        const msg = this.#_createMessageProxy(message);
        const timestamp = new Date();
        const stack = this.#getFormattedStackTrace(this.stack);

        this.#name = name;
        this.#message = msg;
        this.#timestamp = timestamp;
        this.#stacktrace = stack;

        this.#data = {
            name: name,
            message: msg,
            timestamp: timestamp,
            stack: stack
        };
    }

    addData(data)
    {
        if (typeof data !== 'object') data = { data };

        Object.assign(this.#data, data);

        return this;
    }

    getData()
    {
        return this.#data;
    }

    toJSON()
    {
        return JSON.stringify(this.#data, null, 2);
    }

    toString() {
        return `Error: ${this.#name}\nMessage: ${this.#message()}\nTime: ${this.#timestamp}\nStack: ${this.#stacktrace}`;
    }

    static fromJSON(_json, _throw = false)
    {
        const data = JSON.parse(_json);
        const error = new MainError(data.name, data.message);
        const filter = (_input) => ['name', 'message', 'timestamp', 'stack'].includes(_input);

        Object.keys(data).forEach(key =>
        {
            if (!filter(key)) error.addData({ [key]: data[key] });
            else error.addData({ [`${key}-original`]: data[key] });
        });

        if (_throw) throw error;
        return error;
    }

    static fromErrorCode(_errorCode, _throw = false)
    {
        let code = errors[_errorCode] ? _errorCode : 'DLE1005';

        const { name, message } = errors[code];
        const error = new MainError(name, message).addData({ code });

        if (_throw) throw error;
        return error;
    }

    static getStacktraceFormatter()
    {
        return getFormattedStackTrace;
    }

    #getParsedStackTrace(_stacktrace)
    {
        return _stacktrace
            .split('\n')
            .slice(1)
            .map(line =>
            {
                const match = line.match(/\s*at\s+(.*?)\s+\((.*?):(\d+):(\d+)\)/) || line.match(/\s*at\s+(.*?):(\d+):(\d+)/); // fallback no function
                if (match)
                {
                    const [_, func, file, line, column] = match;
                    return {
                        function: func || '<anonymous>',
                        file,
                        line: parseInt(line, 10),
                        column: parseInt(column, 10)
                    };
                }
                return { raw: line.trim() };
            });
    }

    /**
     * Formats the stack trace into a readable string format.
     * @param {string} _stacktrace
     * @param {number} _maxEntries Maximum stack entries to display.
     * @return {string}
     */
    #getFormattedStackTrace(_stacktrace, _maxEntries = 15)
    {
        return this.#getParsedStackTrace(_stacktrace).slice(0, _maxEntries).map(entry =>
        {
            if (entry.raw) return `at ${entry.raw}`;
            else return `at ${entry.function} (${entry.file}:${entry.line}:${entry.column})`;
        }).join('\n');
    }

    /**
     * Creates a proxy for the message property, allowing it to be accessed as a
     * function with parameters only when called, or as a default value otherwise.
     *
     * @param {Function|string} message - The message function or string from ErrorCodes
     * @return {Function} - Proxy function that acts as both callable and readable property
     */
    #_createMessageProxy(message)
    {
        const messageFn = typeof message === 'function' ? message : () => message;

        return new Proxy(messageFn, {
            apply: (_, __, args) => {
                this.#args = args;
                return messageFn(...args)
            },
            get: (_, prop) => (prop === 'toString') ? () => messageFn(...this.#args) : messageFn(...this.#args),
        });
    }
}

module.exports = MainError;