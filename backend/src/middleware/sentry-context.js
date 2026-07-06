const Sentry = require('@sentry/node');

function sentryContext(req, res, next) {
  if (req.user) {
    Sentry.setUser({
      id: req.user._id,
      workerId: req.user._id,
      companyId: req.user.company || null,
    });
  }
  
  Sentry.setTag('requestId', req.id || 'unknown');
  Sentry.setTag('environment', process.env.NODE_ENV || 'development');
  
  next();
}

module.exports = sentryContext;
