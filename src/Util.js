const url = require('url');

class Util
{
    /**
     * https://github.com/nodejs/node/blob/908292cf1f551c614a733d858528ffb13fb3a524/lib/_http_client.js#L68
     */
    normalizeClientRequestArgs(_input, _options, _callback)
    {
        /**
         * https://github.com/nodejs/node/blob/908292cf1f551c614a733d858528ffb13fb3a524/lib/internal/url.js#L1257
         */
        function urlToOptions(_url)
        {
            const options = {
                protocol: _url.protocol,
                hostname:
                    typeof _url.hostname === 'string' && _url.hostname.startsWith('[')
                        ? _url.hostname.slice(1, -1)
                        : _url.hostname,
                hash: _url.hash,
                search: _url.search,
                pathname: _url.pathname,
                path: `${_url.pathname}${_url.search || ''}`,
                href: _url.href,
            }
            if (_url.port !== '') {
                options.port = Number(_url.port)
            }
            if (_url.username || _url.password) {
                options.auth = `${_url.username}:${_url.password}`
            }
            return options
        }

        if (typeof _input === 'string') _input = urlToOptions(new url.URL(_input))
        else if (_input instanceof url.URL) _input = urlToOptions(_input)
        else
        {
            _callback = _options
            _options = _input
            _input = null
        }

        if (typeof _options === 'function')
        {
            _callback = _options
            _options = _input || {}
        }
        else _options = Object.assign(_input || {}, _options)

        return { options: _options, callback: _callback }
    }
}

module.exports = new Util();