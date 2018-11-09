import { buildDomainRole, buildDomainAndRole } from './domainBuilders'
import { Feature } from '../../server/models/Feature';

let guestDomainRole = function() {
  return async () => {
    const adminRole = await buildDomainAndRole('Site', 'Admin');
    const siteDomain = adminRole.domain
    const guestRole = await buildDomainRole('Guest', siteDomain, adminRole._id);
    return guestRole;
  }
}();

let authorizationFeature = function() {
  return async (version: string = '0.0.0') => {
    const guestRole = await guestDomainRole();
    return await Feature.add({ name: 'Authorization',
                               domain: guestRole.domain,
                               domainRole: guestRole,
                               parent: null,
                               feabSemver: version,
                             });
  }
}();

export {
  authorizationFeature,
  guestDomainRole,
}
