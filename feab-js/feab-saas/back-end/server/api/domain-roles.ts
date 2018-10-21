import * as express from 'express';

// import logger from '../logs';
// import { Domain } from '../models/Domain';
// import { DomainRole } from '../models/DomainRole';

const router = express.Router();

// TODO: check for DomainRole Leader properly

/*
router.use((req, res, next) => {
  logger.debug('domainRole leader API', req.path);

  if (!req.domain) {
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }

  next();
});

router.post('/domainRoles/add', async (req, res, next) => {
  try {
    const { name, avatarUrl } = req.body;

    logger.debug(`Express route: ${name}, ${avatarUrl}`);

    const domainRole = await DomainRole.add({ domainId: req.domain.id, name, avatarUrl });

    res.json(domainRole);
  } catch (err) {
    next(err);
  }
});

router.post('/domainRoles/update', async (req, res, next) => {
  try {
    const { domainRoleId, name, avatarUrl } = req.body;

    const domainRole = await DomainRole.updateDomainRole({
      domainId: req.domain.id,
      domainRoleId,
      name,
      avatarUrl,
    });

    res.json(domainRole);
  } catch (err) {
    next(err);
  }
});
*/

export default router;
