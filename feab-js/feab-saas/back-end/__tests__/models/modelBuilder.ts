import { Domain } from '../../server/models/Domain';
import DomainRole from '../../server/models/DomainRole';
import Team from '../../server/models/Team';
import User from '../../server/models/User';
import { generateNumberSlug, generateSlug } from '../../server/utils/slugify';

let owner = function() {
  return async (email: string = null) => {
    if (!email) email = 'foo+bar@example.com';

    let usr = await User.findOne({ email });
    if (usr) {
      return usr;
    }
    const dName = 'Jim McBob';
    const slug = await generateSlug(User, dName);
    usr = await User.create({
      createdAt: new Date(),
      googleId: 'userGoogleId-abc123',
      email: email,
      googleToken: 'userGoogleToken',
      name: dName,
      avatarUrl: 'http://avatarUrl.com',
      slug,
      defaultTeamSlug: '',
    });
    return usr;
  }
}();

let ownerTeam = function() {
  return async (domainOwner) => {
    let tm = await Team.findOne({ teamLeaderId: domainOwner.id });
    if (tm) {
      return tm;
    }

    const defaultTeam = true;
    const slug = await generateNumberSlug(Team);
    const userId = domainOwner.id;
    
    tm = await Team.create({
      teamLeaderId: userId,
      name: 'Team Name',
      slug,
      avatarUrl: 'http://avatarUrl.com',
      memberIds: [userId],
      createdAt: new Date(),
      defaultTeam,
    });
    return tm;
  }
}();

let buildDomain = function() {
  return async (dname: string, email: string = null) => {
    const domainOwner = await owner(email);
    const domainTeam = await ownerTeam(domainOwner);

    const domain = await Domain.add({ userId: domainOwner.id,
                                      name: dname,
                                      teamId: domainTeam.id });
    return domain;
  }
}();
  
let buildDomainRole = function() {
  return async (name, domain, parentId) => {
    const role = await DomainRole.add({ domain: domain,
                                        name: name,
                                        parentId: parentId });
    return role;
  }
}();

let buildDomainAndRole = function() {
  return async (domainName: string, domainRoleName: string) => {
    const domain = await buildDomain(domainName);
    const domainRole = await buildDomainRole(domainRoleName, domain, null);
    return [domain, domainRole];
  }
}();

export {
  buildDomain,
  buildDomainRole,
  buildDomainAndRole,
  owner,
  ownerTeam,
}
