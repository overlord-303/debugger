const Util = require('./Util.js');
const MainError = require('./MainError.js');

/**
 * @return {import('./../Debugger')}
 */
const getDebugger = () => require('./../Debugger.js');

class HttpRequestInterceptor
{
    #ORIGINAL_MODULES = {}

    constructor()
    {
        this.#wrapHttpRequest();
        //this.#run();
    }

    #run()
    {
        this.#wrapHttpRequest();

        this.#wrapAxiosRequest();
        this.#wrapAxiosResponse();

        this.#wrapFetchRequest();
        this.#wrapFetchResponse();
    }

    /**
     * @param {'http'|'https'} _moduleName
     */
    restore(_moduleName)
    {
        const module = require(_moduleName);
        const originalModules = this.#ORIGINAL_MODULES[_moduleName];

        ;['get', 'request'].forEach(func => {
            module[func] = originalModules[func];
        });
    }

    // HTTP(S)

    #wrapHttpRequest()
    {
       this.#wrapHttpModule(this.#requestCallback);
    }

    #wrapHttpModule(_requestCallback)
    {
        const addToOriginalModules = (key, obj) => Object.keys(this.#ORIGINAL_MODULES).includes(key) ? true : this.#ORIGINAL_MODULES[key] = obj;

        const logCallback = (_request, _end = false) =>
        {
            const { method, path, headers } = _request;
            const startTime = Date.now();
            const proto = (_proto) => _proto.replace(':', '').toUpperCase();

            _request.on('response', (response) =>
            {
                /**
                 * @typedef {Object} response.socket._httpMessage
                 */

                getDebugger().log(`${proto(response.socket._httpMessage.protocol)} Request:`, {
                    method,
                    host: response.socket._httpMessage.host,
                    path,
                    headers,
                    statusCode: response.statusCode,
                    duration: Date.now() - startTime,
                });
                response.socket.end();
            });

            _end ? _request.end() : void 0;
        };

        ;['http', 'https'].forEach(function (proto)
        {
            const moduleName = proto;
            const module = require(proto);
            const overriddenRequest = module.request;
            const overriddenGet = module.get;

            if (addToOriginalModules(moduleName,{
                    module,
                    request: overriddenRequest,
                    get: overriddenGet,
                }) === true
            )
            {
                const error = MainError.fromErrorCode('DLE5003').addData({ module: moduleName });
                error.getData().message(moduleName);
                throw error;
            }

            module.request = function (input, options, callback) {
                const req = _requestCallback(proto, overriddenRequest.bind(module), [
                    input,
                    options,
                    callback,
                ]);
                logCallback(req);
                return req;
            }
            module.get = function (input, options, callback) {
                const req = _requestCallback(proto, overriddenGet.bind(module), [
                    input,
                    options,
                    callback,
                ]);
                logCallback(req, true);
                return req
            }
        });
    }

    #requestCallback(_proto, _overriddenRequest, _args)
    {
        const { options, callback } = Util.normalizeClientRequestArgs(..._args);

        if (Object.keys(options).length === 0) throw MainError.fromErrorCode('DLE5002').addData({ args: _args, normalizedClientRequestArgs: { options: options, callback: callback } });

        options.proto = _proto;

        return _overriddenRequest(options, callback);
    }

    // OTHERS

    #wrapAxiosRequest()
    {}

    #wrapAxiosResponse()
    {}

    #wrapFetchRequest()
    {}

    #wrapFetchResponse()
    {}
}

module.exports = new HttpRequestInterceptor();
