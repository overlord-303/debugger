// MainError.d.ts

declare module 'debugger-logger/src/MainError'
{
    type Data = {
        name: string,
        message: Function|string,
        timestamp: Date,
        stack: string,
        code?: string,

        [key: string]: any;
    }

    type StacktraceArray = (
        {
            function: string;
            file: string;
            line: number;
            column: number;
        } |
        {
            raw: string;
        })[];

    /**
     * A custom error class for handling enriched error information with structured stack traces and additional data.
     */
    declare class MainError extends Error
    {
        /**
         * Initializes a new instance of the MainError class.
         * @param name - The name of the error.
         * @param message - The message of the error.
         */
        constructor(name: string, message: string);

        /**
         * Adds data to the error object.
         * @param data - An object or any data type to be added to the error.
         * @returns The updated error instance with added data.
         */
        addData(data: Record<string, any> | any): MainError;

        /**
         * Returns the current error object's data property.
         * @returns An object containing error details.
         */
        getData(): Data;

        /**
         * Parses a stack trace string and returns a `StacktraceArray` with detailed stack information.
         */
        getStacktraceArray(): StacktraceArray;

        /**
         * Converts the error to a JSON string, useful for logging.
         * @returns A JSON string representing the error.
         */
        toJSON(): string;

        /**
         * Formats the error into a readable string, helpful for console output.
         * @returns A string representing the formatted error.
         */
        toString(): string;

        /**
         * Static factory method to create an error instance from JSON data.
         * @param _json - A JSON string to parse into an error object.
         * @param _throw - If true, throws the created error instance.
         * @returns A new MainError instance populated with data from JSON.
         * @throws {MainError} Throws the created error if `_throw` is true.
         */
        static fromJSON(_json: string, _throw?: boolean): MainError;

        /**
         * Static factory method to create an error from an error code.
         * @param _errorCode - The error code to look up.
         * @param _throw - If true, throws the created error instance.
         * @returns A new MainError instance with data based on the error code.
         * @throws {MainError} Throws the created error if `_throw` is true.
         */
        static fromErrorCode(_errorCode: string, _throw?: boolean): MainError;

        static getStacktraceFormatter(): function;

        /**
         * Creates a proxy for the message property, allowing it to be accessed as a
         * function with parameters only when called, or as a default value otherwise.
         * @returns Proxy function that acts as both callable and readable property
         */
        #_createMessageProxy(_message: Function|string): Proxy<Function>
    }

    export = MainError;
}
