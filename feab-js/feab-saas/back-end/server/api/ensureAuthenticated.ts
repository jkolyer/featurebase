import logger from '../logs';

export function ensureAuthenticated(req, res, next) {
  logger.debug(`ensureAuthenticated: ${req.path}`);

  if (!req.user) {
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }
  next();
}
