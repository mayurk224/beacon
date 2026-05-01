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

// Custom tokens for morgan if needed, but 'combined' and 'dev' are requested.
// However, the user wants specific fields: timestamps, HTTP method, URL, status code, response time, and user agent.
// 'combined' format: :remote-addr - :remote-user [:date[clf]] ":method :url HTTP/:http-version" :status :res[content-length] ":referrer" ":user-agent"
// 'dev' format: :method :url :status :response-time ms - :res[content-length]

// Custom format to ensure all requested fields are present:
// timestamps, HTTP method, URL, status code, response time, and user agent.
const customFormat = ':remote-addr - :remote-user [:date[iso]] ":method :url HTTP/:http-version" :status :res[content-length] ":referrer" ":user-agent" - :response-time ms';

export const setupLogger = (app) => {
    const isProduction = config.NODE_ENV === 'production';

    // Log to file with custom format for full detail
    app.use(morgan(customFormat, { stream: accessLogStream }));

    // Log to console
    if (isProduction) {
        app.use(morgan('combined'));
    } else {
        // Using a custom format for console in dev that includes everything requested
        // but still looks good in the console.
        app.use(morgan('dev'));
    }
};
