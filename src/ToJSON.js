class ToJSON
{
    constructor(item)
    {
        const preparedData = this.#_prepareForLogging(item, this.#_prepareForLogging);

        Object.assign(this, preparedData);
    }

    #_prepareForLogging(item, fn, seen = new WeakSet())
    {
        const prepareForLogging = fn;

        if (item === null || typeof item !== "object") return item;

        if (seen.has(item)) return "[Circular]";
        seen.add(item);

        if (Array.isArray(item)) return item.map(element => prepareForLogging(element, prepareForLogging, seen));
        if (Buffer.isBuffer(item)) return item.toString();
        if (item instanceof Date) return item.toISOString();
        if (item instanceof Map) return Array.from(item.entries()).map(([key, value]) => [key, prepareForLogging(value, prepareForLogging, seen)]);
        if (item instanceof Set) return Array.from(item).map(value => prepareForLogging(value, prepareForLogging, seen));
        if (ArrayBuffer.isView(item)) return Array.from(item);
        Object.getOwnPropertySymbols(item).forEach(symbol => item[symbol] = symbol.toString());

        const processedObject = {};

        for (const key of Object.keys(item))
        {
            const value = item[key];

            if (typeof value === "function" || typeof value === "bigint") processedObject[key] = value.toString();
            else processedObject[key] = prepareForLogging(value, prepareForLogging, seen);
        }

        return processedObject;
    }

    toString() {
        return JSON.stringify(this, null, 2);
    }
}

module.exports = ToJSON;