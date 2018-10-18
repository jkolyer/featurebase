import Domain from '../../server/models/Domain';
import DomainRole from '../../server/models/DomainRole';
import Team from '../../server/models/Team';
import User from '../../server/models/User';
import * as mongoose from 'mongoose';
import * as _ from 'lodash';

import { generateNumberSlug, generateSlug } from '../../server/utils/slugify';

let owner = function() {
  let userId;
  return async () => {
    if (userId) return await User.findById(userId);

    const email = 'foo+bar@example.com';
    let usr = await User.findOne({ email });
    if (usr) {
      userId = usr.id;
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
    userId = usr.id;
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
  return async (dname) => {
    const domainOwner = await owner();
    const domainTeam = await ownerTeam(domainOwner);

    const domain = await Domain.add({ userId: domainOwner.id,
                                      name: dname,
                                      teamId: domainTeam.id });
    return domain;
  }
}();
  
describe('creating domains', () => {

  beforeAll(async () => {
    await mongoose.connect(process.env.MONGO_URL_TEST);
  });
  
  beforeEach(async () => {
    await Domain.remove({});
  });
  
  test('should be valid', async (done) => {
    const dname = 'Site';
    const domain = await buildDomain(dname);
    expect(domain.slug).toEqual('site');
    expect(domain.name).toEqual(dname);
    
    domain.validate((err) => {
      expect(err).toBeNull();
      done();
    });
  });
  
  test('should get list of domains', async (done) => {
    const dname1 = 'Site';
    const dname2 = 'Adhoc';
    const dname3 = 'Vertical';
    
    await buildDomain(dname1);
    await buildDomain(dname2);
    await buildDomain(dname3);

    const user = await owner();
    const team = await ownerTeam(user);
    
    const dlist = await Domain.getList({ userId: user.id, teamId: team.id });
    const domains = dlist.domains
    expect(domains.length).toEqual(3);
    expect(domains[0].name).toEqual(dname1);
    expect(domains[1].name).toEqual(dname2);
    expect(domains[2].name).toEqual(dname3);

    done();
  });
  
  test('should not create duplicate domains', async (done) => {
    const dname = 'Site';
    await buildDomain(dname);

    expect.assertions(1);
    try {
      await buildDomain(dname);
    } catch (err) {
      expect(err.name).toEqual('DuplicateDomainName');
    }

    done();
  });
  
});

describe('creating domain roles', () => {
  let buildDomainRole = function() {
    return async (name, domain, parentId) => {
      const role = await DomainRole.add({ domainId: domain.id,
                                          name: name,
                                          parentId: parentId });
      return role;
    }
  }();

  beforeAll(async () => {
    await mongoose.connect(process.env.MONGO_URL_TEST);
  });
  
  beforeEach(async () => {
    await Domain.remove({});
    await DomainRole.remove({});
  });
  
  test('should be valid role', async (done) => {
    const domain = await buildDomain('Site');
    const domainRole = await buildDomainRole('Admin', domain, null);

    expect(domainRole.slug).toEqual('admin');
    expect(domainRole.name).toEqual('Admin');
    
    domainRole.validate((err) => {
      expect(err).toBeNull();
      done();
    });
  });
  
  test('should disallow duplicate role names within domain', async (done) => {
    const domain = await buildDomain('Site');
    const roleName = 'Admin';
    await buildDomainRole(roleName, domain, null);

    expect.assertions(1);
    try {
      await buildDomainRole(roleName, domain, null);
    } catch (err) {
      expect(err.name).toEqual('DuplicateDomainRoleName');
    }

    done();
  });
  
});

