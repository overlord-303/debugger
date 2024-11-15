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

function getFormattedStackTrace(_stacktrace, _maxEntries = 15)
{
    return getParsedStackTrace(_stacktrace).slice(0, _maxEntries).map(entry =>
    {
        if (entry.raw) return `   at ${entry.raw}`;
        else return `   at ${entry.function} (${entry.file}:${entry.line}:${entry.column})`;
    }).join('\n');
}

module.exports = { getFormattedStackTrace };
