// HttpRequestInterceptor.d.ts
// noinspection JSUnusedGlobalSymbols

declare module 'debugger-logger/src/HttpRequestInterceptor'
{
    import * as http from "node:http";
    import * as https from "node:https";

    type ModuleBackup = {
        module: http|https,
        request: http.request|https.request,
        get: http.get|https.get,
    }

    enum ModuleBackupType {
        'http',
        'https',
    }

    type RequestCallbackType = <R>(proto: string, overriddenRequest: (...args: any[]) => R, args: any[]) => R;

    /**
     * Modifies Http & Https modules to intercept and log http requests globally.
     */
    class HttpRequestInterceptor
    {
        #ORIGINAL_MODULES : { [key: string]: ModuleBackup } = {};

        /**
         * Restore modules back to their original state.
         */
        restore(_moduleName: keyof typeof ModuleBackupType): void;

        #wrapHttpRequest(): void;
        #requestCallback: RequestCallbackType;
        #wrapHttpModule(_requestCallback: RequestCallbackType): void;
    }

    const HRI: HttpRequestInterceptor;

    export { HRI, ModuleBackupType };
}