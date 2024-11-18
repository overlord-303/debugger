declare module 'debugger-logger/src/ToJSON'
{
    type LoggingFunction = (item: any, fn: LoggingFunction, seen?: WeakSet<object>) => any;

    /**
     * Class for turning (complex) objects into {@link JSON.stringify json formattable} objects.
     */
    class ToJSON
    {
        constructor(item: any);

        /**
         * Returns the object as a json formatted string.
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