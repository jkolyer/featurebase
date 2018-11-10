import * as express from 'express';

// import logger from '../logs';
import { Domain } from '../models/Domain';
import { DomainRole } from '../models/DomainRole';
import { ensureAuthenticated } from './ensureAuthenticated';

const router = express.Router();

router.use(ensureAuthenticated);

router.get('/:domainId/roles', async (req, res, next) => {
  try {
    const teamId = req.query.team_id;
    const domainId = req.params.domainId;
    const domain = await Domain.getDomain({ userId: req.user.id, teamId, domainId });
    const roles = await DomainRole.getList({ domain });
    res.json({ domain, roles });

  } catch (err) {
    next(err);
  }
});

router.get('/:domainId/roles/:roleId', async (req, res, next) => {
  try {
    const teamId = req.query.team_id;
    const domainId = req.params.domainId;
    const roleId = req.params.roleId;
    const domain = await Domain.getDomain({ userId: req.user.id, teamId, domainId });
    const role = await DomainRole.getRole({ domain, roleId });
    res.json({ domain, role });

  } catch (err) {
    next(err);
  }
});

router.post('/:domainId/roles', async (req, res, next) => {
  try {
    const { name, parentId } = req.body;

    const teamId = req.query.team_id;
    const domainId = req.params.domainId;
    const domain = await Domain.getDomain({ userId: req.user.id, teamId, domainId });

    let parent: any = null;
    if (parentId) {
      parent = await DomainRole.getRole({ domain, roleId: parentId });
      // TODO:  bail out if no parent
    }
    const role = await DomainRole.add({ domain, name, parent });

    res.json({ domain, role });

  } catch (err) {
    next(err);
  }
});

router.put('/:domainId/roles/:roleId', async (req, res, next) => {
  try {
    const { name, parentId } = req.body;

    const teamId = req.query.team_id;
    const domainId = req.params.domainId;
    const roleId = req.params.roleId;
    const domain = await Domain.getDomain({ userId: req.user.id, teamId, domainId });

    let parent: any = null;
    if (parentId) {
      parent = await DomainRole.getRole({ domain, roleId: parentId });
      // TODO:  bail out if no parent
    }
    const role = await DomainRole.edit({ roleId, name, parent });

    res.json({ domain, role });

  } catch (err) {
    next(err);
  }
});

/*
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
