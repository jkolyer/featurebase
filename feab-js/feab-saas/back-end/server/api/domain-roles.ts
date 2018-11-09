import * as express from 'express';

// import logger from '../logs';
import { Domain } from '../models/Domain';
import { ensureAuthenticated } from './ensureAuthenticated';

const router = express.Router();

router.use(ensureAuthenticated);

router.get('/:domainId/roles', async (req, res, next) => {
  try {
    const teamId = req.query.team_id;
    const domainId = req.params.domainId;
    const domain = await Domain.getDomain({ userId: req.user.id, teamId, domainId });
    res.json(domain);

  } catch (err) {
    next(err);
  }
});

/*
router.get('/:slug', async (req, res, next) => {
  try {
    const teamId = req.query.team_id;
    const slug = req.params.slug;

    const domains = await Domain.getList({ userId: req.user.id, teamId, slug });
    res.json(domains);

  } catch (err) {
    next(err);
  }
});

router.post('/', async (req, res, next) => {
  try {
    const { name } = req.body;

    const teamId = req.query.team_id;
    const domain = await Domain.add({ userId: req.user.id, name, teamId });
    res.json(domain);

  } catch (err) {
    next(err);
  }
});

router.put('/:domainId', async (req, res, next) => {
  try {
    const { name } = req.body;

    const domainId = req.params.domainId;
    const domain = await Domain.edit({ userId: req.user.id, name, domainId });
    res.json(domain);

  } catch (err) {
    next(err);
  }
});

router.delete('/:domainId', async (req, res, next) => {
  try {
    const domainId = req.params.domainId;
    const domain = await Domain.delete({ userId: req.user.id, domainId });
    res.json(domain);

  } catch (err) {
    next(err);
  }
});
*/
/*

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
