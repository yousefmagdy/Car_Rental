const morgan = require('morgan');

// Custom token for logging response time with color coding
morgan.token('status-color', (req, res) => {
  const status = res.statusCode;
  if (status >= 500) return '\x1b[31m' + status + '\x1b[0m'; // Red
  if (status >= 400) return '\x1b[33m' + status + '\x1b[0m'; // Yellow
  if (status >= 300) return '\x1b[36m' + status + '\x1b[0m'; // Cyan
  if (status >= 200) return '\x1b[32m' + status + '\x1b[0m'; // Green
  return status;
});

// Development logger with detailed info
const devLogger = morgan(
  ':method :url :status-color :response-time ms - :res[content-length]'
);

// Production logger - combined format (Apache style)
const prodLogger = morgan('combined');

// Export based on environment
module.exports =
  process.env.NODE_ENV === 'production' ? prodLogger : devLogger;

