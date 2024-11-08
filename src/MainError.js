/**
 * @inheritDoc
 */
class MainError extends Error
{
    /**
     * @param {string} name
     * @param {string} message
     */
    constructor(name, message)
    {
        super(message);

        this.name = name

        this.data = {
            message,
        };
    }

    /**
     * Adds data to the error object.
     *
     * @param {Object|*} data
     */
    addData(data)
    {
        if (typeof data !== 'object') data = { data };

        Object.assign(this.data, data);

        return this;
    }

    /**
     * Returns the current error objects data property.
     *
     * @return {Object}
     */
    getData()
    {
        return this.data;
    }
}

module.exports = MainError;