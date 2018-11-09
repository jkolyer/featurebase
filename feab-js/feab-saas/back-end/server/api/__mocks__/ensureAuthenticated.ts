import { owner } from '../../../__tests__/utils/domainBuilders';
import logger from '../../logs';

export async function ensureAuthenticated(req, _, next) {
  logger.debug(`*** __mocks__/ensureAuthenticated: ${req.path}`);

  if (!req.user) {
    req.user = await owner();
  }
  next();
}
