import { Domain } from '../../server/models/Domain';
import { DomainRole } from '../../server/models/DomainRole';
import Team from '../../server/models/Team';
import User from '../../server/models/User';
import { generateNumberSlug, generateSlug } from '../../server/utils/slugify';

const owner = function() {
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

const ownerTeam = function() {
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

const buildDomain = function() {
  return async (dname: string, email: string = null) => {
    const domainOwner = await owner(email);
    const domainTeam = await ownerTeam(domainOwner);

    const domain = await Domain.add({ userId: domainOwner.id,
                                      name: dname,
                                      teamId: domainTeam.id });
    return domain;
  }
}();
  
const buildDomainRole = function() {
  return async (name, domain, parent) => {
    const role = await DomainRole.add({ domain: domain,
                                        name: name,
                                        parent: parent });
    return role;
  }
}();

const buildDomainAndRole = function() {
  return async (domainName: string, domainRoleName: string) => {
    const domain = await buildDomain(domainName);
    const domainRole = await buildDomainRole(domainRoleName, domain, null);
    return domainRole;
  }
}();

const loginCookie = function() {
  return (serverAgent, done) => {
    serverAgent
      .get('/auth/google')
      .expect(302)
      .expect('Location', '/')
      .end((_, res) => {
        done(res.headers['set-cookie']);
      });
  }
}();

export {
  buildDomain,
  buildDomainRole,
  buildDomainAndRole,
  loginCookie,
  owner,
  ownerTeam,
}
