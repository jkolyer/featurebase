import { Domain } from '../../server/models/Domain';
import { DomainRole } from '../../server/models/DomainRole';
import * as mongoose from 'mongoose';
import * as _ from 'lodash';
import { owner,
         ownerTeam,
         buildDomain,
         buildDomainRole } from '../utils/domainBuilders'

describe('creating domains', () => {

  beforeAll(async () => {
    await mongoose.connect(process.env.MONGO_URL_TEST);
  });
  
  beforeEach(async () => {
    await Domain.remove({});
    await DomainRole.remove({});
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
  
  beforeAll(async () => {
    await mongoose.connect(process.env.MONGO_URL_TEST);
  });
  
  beforeEach(async () => {
    await Domain.remove({});
    await DomainRole.remove({});
  });
  
  test('should be valid role', async (done) => {
    const domain = await buildDomain('Site');
    let domainRole = await buildDomainRole('Admin', domain, null);

    expect(domainRole.slug).toEqual('admin');
    expect(domainRole.name).toEqual('Admin');
    expect(domainRole.domain).not.toBeNull();

    // make sure we can view the domain property from freshly fetched doc
    domainRole = await DomainRole.findOne({ _id: domainRole.id });
    expect(domainRole.domain).not.toBeNull();
    
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
  
  test('should allow duplicate role names across domains', async (done) => {
    const domain1 = await buildDomain('Site');
    const roleName = 'Admin';
    await buildDomainRole(roleName, domain1, null);

    expect.assertions(0);
    const domain2 = await buildDomain('Adhoc');
    await buildDomainRole(roleName, domain2, null);
    done();
  });
  
  test('should have parent-child role relationships', async (done) => {
    const domain1 = await buildDomain('Adhoc');
    
    const superUserName = 'Super User';
    const superRole = await buildDomainRole(superUserName, domain1, null);
    
    const premiumUserName = 'Premium User';
    const premiumRole = await buildDomainRole(premiumUserName, domain1, superRole);
    const basicUserName = 'Basic User';
    const basicRole = await buildDomainRole(basicUserName, domain1, premiumRole);

    let parent = await DomainRole.findOne({ _id: premiumRole.parent.id });
    expect(parent.name).toEqual(superUserName);

    parent = await DomainRole.findOne({ _id: basicRole.parent.id });
    expect(parent.name).toEqual(premiumUserName);

    const children = await DomainRole.findChildren({ domainRole: superRole });
    expect(children[0].id).toEqual(premiumRole.id);
    
    done();
  });
  
  test('should updated childs parent on delete', async (done) => {
    await Domain.remove({});
    await DomainRole.remove({});
    
    const domain1 = await buildDomain('Adhoc');
    
    const superUserName = 'Super User';
    const superRole = await buildDomainRole(superUserName, domain1, null);
    
    const premiumUserName = 'Premium User';
    const premiumRole = await buildDomainRole(premiumUserName, domain1, superRole);
    const basicUserName = 'Basic User';
    let basicRole = await buildDomainRole(basicUserName, domain1, premiumRole);

    await DomainRole.delete({ domainRole: premiumRole });

    basicRole = await DomainRole
      .findOne({ _id: basicRole.id })
      .populate('parent')
      .exec(function(err, role) {
        expect(err).toBeNull();
        expect(role.parent.id).toEqual(superRole.id);
        done();
      });
  });
  
});

