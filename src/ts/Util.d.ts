// HttpRequestInterceptor.d.ts
// noinspection JSUnusedGlobalSymbols

declare module 'debugger-logger/src/Util'
{
    type UrlOptions = {
        protocol: string | null;
        hostname: string | null;
        hash: string | null;
        search: string | null;
        pathname: string | null;
        path: string;
        href: string;
        port?: number;
        auth?: string;
    };

    type ClientRequestObject = {
        options: UrlOptions|{},
        callback: function,
    };

    /**
     * Utility class for re-used functionality.
     */
    class Util
    {
        normalizeClientRequestArgs(input: string|URL, options: Object, cb: function): ClientRequestObject
        {
            function urlToOptions(url: URL): UrlOptions;
        }
    }

    export = Util;
}