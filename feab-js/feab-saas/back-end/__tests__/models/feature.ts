import { Domain } from '../../server/models/Domain';
import { DomainRole } from '../../server/models/DomainRole';
import { Feature } from '../../server/models/Feature';
import * as mongoose from 'mongoose';
import * as _ from 'lodash';
import { buildDomainRole, buildDomainAndRole } from './modelBuilder'

let guestDomainRole = function() {
  return async () => {
    const adminRole = await buildDomainAndRole('Site', 'Admin');
    const siteDomain = adminRole.domain
    const guestRole = await buildDomainRole('Guest', siteDomain, adminRole.id);
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

describe('creating features', () => {

  beforeAll(async () => {
    await mongoose.connect(process.env.MONGO_URL_TEST);
  });
  
  beforeEach(async () => {
    await Domain.remove({});
    await DomainRole.remove({});
    await Feature.remove({});
  });
  
  test('should be valid', async (done) => {
    const feature = await authorizationFeature();
    expect(feature.slug).toEqual('authorization');
    expect(feature.feabSemver).toEqual('0.0.0');
    
    feature.validate((err) => {
      expect(err).toBeNull();
      done();
    });
  });
  
  test('invalid semver', async (done) => {
    expect.assertions(1);
    try {
      await authorizationFeature('0.x.0');
    } catch (err) {
      expect(err.name).toEqual('ValidationError');
      done();
    }
  });
  
  test('increment semver', async (done) => {
    let feature = await authorizationFeature();
    
    let part = 'patch';
    await Feature.bumpVersion({ feature, part });
    expect(feature.feabSemver).toEqual('0.0.1');
    
    part = 'minor';
    await Feature.bumpVersion({ feature, part });
    expect(feature.feabSemver).toEqual('0.1.0');
    
    part = 'patch';
    await Feature.bumpVersion({ feature, part });
    expect(feature.feabSemver).toEqual('0.1.1');
    
    part = 'major';
    await Feature.bumpVersion({ feature, part });
    expect(feature.feabSemver).toEqual('1.0.0');

    // make sure what's stored in the db is expected
    feature = await Feature.findOne({ _id: feature });
    expect(feature.feabSemver).toEqual('1.0.0');
    
    done();
  });

  test('add child features', async (done) => {
    done();
  });
  
});

