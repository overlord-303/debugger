/**
 * Parses the stack trace into an array of objects for structured handling.
 * Each entry contains the function name, file, and line/column numbers.
 * @param _stacktrace - The raw stack trace string.
 * @returns An array of objects, each representing a stack frame with function, file, line, and column details.
 */
function getParsedStackTrace(_stacktrace)
{
    return _stacktrace
        .split('\n')
        .slice(1)
        .map(line =>
        {
            const match = line.match(/\s*at\s+(.*?)\s+\((.*?):(\d+):(\d+)\)/) || line.match(/\s*at\s+(.*?):(\d+):(\d+)/); // fallback no function
            if (match)
            {
                const [_, func, file, line, column] = match;
                return {
                    function: func || '<anonymous>',
                    file,
                    line: parseInt(line, 10),
                    column: parseInt(column, 10)
                };
            }
            return { raw: line.trim() };
        });
}

/**
 * Formats the stack trace into a readable string format.
 * @param {string} _stacktrace - The raw stack trace string.
 * @param {number} _maxEntries - Maximum stack entries to display.
 * @param {number} _indent - Indentation amount (in spaces)
 * @param {string} _delimiter - Delimiter joining the strings
 * @returns A formatted string representation of the stack trace.
 */
function getFormattedStackTrace(_stacktrace, _maxEntries = 15, _indent = 3, _delimiter = '\n')
{
    return getParsedStackTrace(_stacktrace).slice(0, _maxEntries).map(entry =>
    {
        const indent = ' '.repeat(Math.max(0, _indent || 0));

        if (entry.raw) return `${indent}at ${entry.raw}`;
        else return `${indent}at ${entry.function} (${entry.file}:${entry.line}:${entry.column})`;
    }).join(_delimiter);
}

module.exports = { getFormattedStackTrace, getParsedStackTrace };
