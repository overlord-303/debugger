const { getFormattedStackTrace } = require('./misc/stacktrace.js');

class ToJSON
{
    constructor(item)
    {
        const preparedData = this.#_prepareForLogging(item, this.#_prepareForLogging);

        Object.assign(this, preparedData);
    }

    #_prepareForLogging(_item, _fn, _seen = new WeakSet())
    {
        const prepareForLogging = _fn;

        if (_item === null || typeof _item !== "object") return _item;

        if (_seen.has(_item)) return "[Circular]";
        _seen.add(_item);

        if (Array.isArray(_item)) return _item.map(element => prepareForLogging(element, prepareForLogging, _seen));
        if (Buffer.isBuffer(_item)) return _item.toString();
        if (_item instanceof Date) return _item.toISOString();
        if (_item instanceof Map) return Array.from(_item.entries()).map(([key, value]) => [key, prepareForLogging(value, prepareForLogging, _seen)]);
        if (_item instanceof Set) return Array.from(_item).map(value => prepareForLogging(value, prepareForLogging, _seen));
        if (ArrayBuffer.isView(_item)) return Array.from(_item);

        if (_item instanceof Error) {
            return {
                name: _item.name,
                message: _item.message,
                stack: getFormattedStackTrace(_item.stack, 15, 0, ', '),
                ...Object.fromEntries(Object.entries(_item).map(([key, value]) => [key, prepareForLogging(value, prepareForLogging, _seen)]))
            };
        }

        Object.getOwnPropertySymbols(_item).forEach(symbol => _item[symbol] = symbol.toString());

        const processedObject = {};

        for (const key of Object.keys(_item))
        {
            const value = _item[key];

            if (typeof value === "function" || typeof value === "bigint") processedObject[key] = value.toString();
            else processedObject[key] = prepareForLogging(value, prepareForLogging, _seen);
        }

        return processedObject;
    }

    toString() {
        return JSON.stringify(this, null, 2);
    }
}

module.exports = ToJSON;