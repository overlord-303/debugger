declare module 'debugger-logger/src/ToJSON'
{
    /**
     * @param {any} item Item to prepare for logging.
     * @param {LoggingFunction} fn Passing the function recursively to prevent issues with object context.
     * @param {WeakSet<Object>} [seen] A WeakSet to check for circular references.
     */
    type LoggingFunction = (_item: any, _fn: LoggingFunction, _seen?: WeakSet<object>) => any;

    /**
     * Class for turning (complex) objects into {@link JSON.stringify json formattable} objects.
     */
    class ToJSON
    {
        constructor(item: any);

        /**
         * Returns the object as a json formatted string.
         *
         * @throws TypeError
         */
        toString(): string;

        /**
         * Prepares an item for logging by handling special data types such as functions,
         * BigInts, Dates, Symbols, Buffers, Maps, Sets, Typed Arrays, and circular references.
         */
        #_prepareForLogging: LoggingFunction
    }

    export = ToJSON;
}