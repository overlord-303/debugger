module.exports = {
    // General Errors (1000 - 1999)
    DLE1001: { name: "ValidationError", message: "Validation error" },
    DLE1002: { name: "MissingFieldError", message: "Missing required field" },
    DLE1003: {
        name: "TypeMismatchError",
        message: (_t1 = false, _t2 = false) => `Type mismatch${(_t1 && _t2) ? ` (${_t1}/${_t2}).` : ''}`
    },
    DLE1004: { name: "InvalidFormatError", message: "Invalid input format" },
    DLE1005: { name: "UnknownError", message: "Unknown error" },
    DLE1010: { name: "ConfigurationError", message: "Configuration error" },
    DLE1011: { name: "DependencyNotFoundError", message: "Dependency not found" },
    DLE1012: { name: "UnsupportedOperationError", message: "Unsupported operation" },

    // I/O Errors (2000 - 2999)
    DLE2001: {
        name: "FileNotFoundError",
        message: (_file = false) => `File${_file ? ` '${_file}'` : ''} not found.`
    },
    DLE2002: {
        name: "FileReadError",
        message: (_file = false) => `File${_file ? ` '${_file}'` : ''} read error.`
    },
    DLE2003: {
        name: "FileWriteError",
        message: (_file = false) => `File${_file ? ` '${_file}'` : ''} write error.`
    },
    DLE2004: { name: "PermissionError", message: "Insufficient permissions" },
    DLE2005: { name: "PathError", message: "Path not accessible" },
    DLE2010: { name: "DiskSpaceError", message: "Disk space error" },
    DLE2011: {
        name: "UnsupportedFileFormatError",
        message: (_format = false) => `File${_format ? ` '${_format}'` : ''} format not supported.`
    },

    // Network Errors (3000 - 3999)
    DLE3001: { name: "ConnectionError", message: "Connection failed" },
    DLE3002: { name: "TimeoutError", message: "Connection timeout" },
    DLE3003: { name: "DNSError", message: "DNS resolution error" },
    DLE3004: { name: "ProtocolError", message: "Protocol mismatch" },
    DLE3005: { name: "NetworkUnreachableError", message: "Network unreachable" },
    DLE3010: { name: "RemoteHostError", message: "Remote host not responding" },
    DLE3011: { name: "SSLHandshakeError", message: "SSL/TLS handshake failure" },

    // Database Errors (4000 - 4999)
    DLE4001: { name: "DatabaseConnectionError", message: "Database connection failed" },
    DLE4002: { name: "QuerySyntaxError", message: "Query syntax error" },
    DLE4003: { name: "DataIntegrityError", message: "Data integrity violation" },
    DLE4004: { name: "TransactionError", message: "Transaction rollback" },
    DLE4005: { name: "RecordNotFoundError", message: "Record not found" },
    DLE4010: { name: "DatabaseTimeoutError", message: "Database timeout" },
    DLE4011: { name: "DatabasePermissionError", message: "Database permission denied" },

    // Custom Logic Errors (5000 - 5999)
    DLE5001: { name: "SingletonError", message: "Instance already exists" },
    DLE5002: { name: "EmptyOptionsObjectError", message: "Making a request with empty `options` is not supported" },
    DLE5003: {
        name: "ModuleOverwriteError",
        message: (_proto = false) => `Module's request already overridden for protocol${_proto ? ` '${_proto}'`: ''}.`
    },
};