const toJSON = require('./ToJSON.js');
const errors = require('./misc/errors.js');
const { getFormattedStackTrace, getParsedStackTrace } = require('./misc/stacktrace.js');

/**
 * @inheritDoc
 */
class MainError extends Error
{
    #name;
    #message;
    #timestamp;
    #stacktrace;
    #stacktraceArray;

    #data = {};
    #args = [];

    constructor(name, message)
    {
        super(typeof message === 'function' ? message() : message);
        super.name = name;

        const msg = this.#_createMessageProxy(message);
        const timestamp = new Date();

        this.#name = name;
        this.#message = msg;
        this.#timestamp = timestamp;
        this.#stacktrace = getFormattedStackTrace(this.stack);
        this.#stacktraceArray = getParsedStackTrace(this.stack);

        this.#data = {
            name: name,
            message: msg,
            timestamp: timestamp,
            stack: getFormattedStackTrace(this.stack, 15, 0, ', '),
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

    getStacktraceArray()
    {
        return this.#stacktraceArray;
    }

    toJSON()
    {
        return `${new toJSON(this.#data)}`;
    }

    toString() {
        return `Error: ${this.#name}, Message: ${this.#message()}, Time: ${this.#timestamp}, Stack:\n${this.#stacktrace}`;
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

    #_createMessageProxy(_message)
    {
        const messageFn = typeof _message === 'function' ? _message : () => _message;

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
