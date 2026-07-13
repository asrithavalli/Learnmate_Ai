'use strict';

/* ── Global error handler ─────────────────────────────────────
   Registered last in server.js via app.use(errorHandler).
   Catches any error forwarded with next(err).
─────────────────────────────────────────────────────────────── */

// eslint-disable-next-line no-unused-vars
function errorHandler(err, _req, res, _next) {
  const statusCode = err.status || err.statusCode || 500;
  const message    = err.message || 'An unexpected server error occurred.';

  console.error(`[ERROR] ${statusCode} – ${message}`);
  if (process.env.NODE_ENV !== 'production') {
    console.error(err.stack);
  }

  res.status(statusCode).json({
    success: false,
    message,
    ...(process.env.NODE_ENV !== 'production' && { stack: err.stack }),
  });
}

module.exports = errorHandler;
