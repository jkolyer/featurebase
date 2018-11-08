import * as express from 'express';

// import logger from '../logs';
import { Domain } from '../models/Domain';
import ensureAuthenticated from './ensureAuthenticated';

const router = express.Router();

router.use(ensureAuthenticated);

router.get('/domains/', async (req, res, next) => {
  try {
    const teamId = null; // req.team ? req.team.id : null;
    const domains = await Domain.getList({ userId: req.user.id, teamId });
    res.json(domains);
  } catch (err) {
    next(err);
  }
});

/*
router.post('/domains/add', async (req, res, next) => {
  try {
    const { name, avatarUrl } = req.body;

    logger.debug(`Express route: ${name}, ${avatarUrl}`);

    const domain = await Domain.add({ userId: req.user.id, name, avatarUrl });

    res.json(domain);
  } catch (err) {
    next(err);
  }
});

router.post('/domains/update', async (req, res, next) => {
  try {
    const { domainId, name, avatarUrl } = req.body;

    const domain = await Domain.updateDomain({
      userId: req.user.id,
      domainId,
      name,
      avatarUrl,
    });

    res.json(domain);
  } catch (err) {
    next(err);
  }
});

router.get('/domains/get-roles', async (req, res, next) => {
  try {
    const users = await User.getDomainMembers({ userId: req.user.id, domainId: req.query.domainId });

    res.json({ users });
  } catch (err) {
    next(err);
  }
});

router.post('/domains/remove-role', async (req, res, next) => {
  try {
    const { domainId, userId } = req.body;

    await Domain.removeMember({ domainLeaderId: req.user.id, domainId, userId });

    res.json({ done: 1 });
  } catch (err) {
    next(err);
  }
});
*/

export default router;
