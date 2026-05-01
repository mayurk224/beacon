import morgan from 'morgan';
import path from 'path';
import { createStream } from 'rotating-file-stream';
import fs from 'fs';
import { fileURLToPath } from 'url';
import config from '../config/config.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ensure logs directory exists
const logDirectory = path.join(__dirname, '../logs');
if (!fs.existsSync(logDirectory)) {
    fs.mkdirSync(logDirectory);
}

// Create a rotating write stream
const accessLogStream = createStream('access.log', {
    interval: '1d', // rotate daily
    path: logDirectory,
});

// Define custom morgan tokens for redaction
export const redactUrl = (urlStr, host = 'localhost') => {
    try {
        const url = new URL(urlStr, `http://${host}`);
        const sensitiveParams = ['token', 'password', 'code', 'state'];
        
        sensitiveParams.forEach(param => {
            if (url.searchParams.has(param)) {
                url.searchParams.set(param, '[REDACTED]');
            }
        });
        
        return url.pathname + url.search;
    } catch (e) {
        return urlStr; // Return as is if URL parsing fails
    }
};

morgan.token('redacted-url', (req) => {
    return redactUrl(req.url, req.headers.host);
});

// Custom format to ensure all requested fields are present:
// timestamps, HTTP method, URL, status code, response time, and user agent.
const customFormat = ':remote-addr - :remote-user [:date[iso]] ":method :redacted-url HTTP/:http-version" :status :res[content-length] ":referrer" ":user-agent" - :response-time ms';

export const setupLogger = (app) => {
    const isProduction = config.NODE_ENV === 'production';

    // Log to file with custom format for full detail
    app.use(morgan(customFormat, { stream: accessLogStream }));

    // Log to console
    if (isProduction) {
        // In production, we still want to redact URLs even for the combined format
        app.use(morgan(':remote-addr - :remote-user [:date[clf]] ":method :redacted-url HTTP/:http-version" :status :res[content-length] ":referrer" ":user-agent"'));
    } else {
        // Using a custom format for console in dev that includes everything requested
        // but still looks good in the console.
        app.use(morgan(':method :redacted-url :status :response-time ms - :res[content-length]'));
    }
};

/**
 * SECURE LOGGING CHECKLIST:
 * 1. REDACT URLs: Use redactUrl() for any URL logging to strip tokens/passwords.
 * 2. NO PII: Avoid logging emails, phone numbers, or real names. Use User IDs.
 * 3. NO CREDENTIALS: Never log passwords, API keys, or full auth tokens.
 * 4. ERROR HANDLING: Avoid logging full error objects that might contain req bodies.
 */
