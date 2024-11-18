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
 * @param _stacktrace - The raw stack trace string.
 * @param _maxEntries - Maximum stack entries to display.
 * @returns A formatted string representation of the stack trace.
 */
function getFormattedStackTrace(_stacktrace, _maxEntries = 15)
{
    return getParsedStackTrace(_stacktrace).slice(0, _maxEntries).map(entry =>
    {
        if (entry.raw) return `   at ${entry.raw}`;
        else return `   at ${entry.function} (${entry.file}:${entry.line}:${entry.column})`;
    }).join('\n');
}

module.exports = { getFormattedStackTrace, getParsedStackTrace };
