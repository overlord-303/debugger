const url = require('url');

class Util
{
    /**
     * https://github.com/nodejs/node/blob/908292cf1f551c614a733d858528ffb13fb3a524/lib/_http_client.js#L68
     */
    normalizeClientRequestArgs(input, options, cb)
    {
        /**
         * https://github.com/nodejs/node/blob/908292cf1f551c614a733d858528ffb13fb3a524/lib/internal/url.js#L1257
         */
        function urlToOptions(url)
        {
            const options = {
                protocol: url.protocol,
                hostname:
                    typeof url.hostname === 'string' && url.hostname.startsWith('[')
                        ? url.hostname.slice(1, -1)
                        : url.hostname,
                hash: url.hash,
                search: url.search,
                pathname: url.pathname,
                path: `${url.pathname}${url.search || ''}`,
                href: url.href,
            }
            if (url.port !== '') {
                options.port = Number(url.port)
            }
            if (url.username || url.password) {
                options.auth = `${url.username}:${url.password}`
            }
            return options
        }

        if (typeof input === 'string') input = urlToOptions(new url.URL(input))
        else if (input instanceof url.URL) input = urlToOptions(input)
        else
        {
            cb = options
            options = input
            input = null
        }

        if (typeof options === 'function')
        {
            cb = options
            options = input || {}
        }
        else options = Object.assign(input || {}, options)

        return { options, callback: cb }
    }
}

module.exports = new Util();