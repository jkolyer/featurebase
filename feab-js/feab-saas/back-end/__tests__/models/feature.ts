import Domain from '../../server/models/Domain';
import DomainRole from '../../server/models/DomainRole';
import Feature from '../../server/models/Feature';
import * as mongoose from 'mongoose';
import * as _ from 'lodash';
import { buildDomainRole, buildDomainAndRole } from './modelBuilder'

// let guestDomainRole = function() {
//   return async () => {
//     const objs = await buildDomainAndRole('Site', 'Admin');
//     const siteDomain = objs[0];
//     const adminRole = objs[1];
//     const guestRole = await buildDomainRole('Guest', siteDomain, adminRole.id);
//     return guestRole;
//   }
// }();

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
    const objs = await buildDomainAndRole('Site', 'Admin');
    const siteDomain = objs[0]
    const adminRole = objs[1]
    const guestRole = await buildDomainRole('Guest', siteDomain, adminRole.id);

    const feature = await Feature.add({ name: 'Authorization',
                                        domainId: siteDomain.id,
                                        domainRoleId: guestRole.id,
                                        parentId: null,
                                        feabSemver: '0.0.0' })
    expect(feature.slug).toEqual('authorization');
    
    feature.validate((err) => {
      expect(err).toBeNull();
      done();
    });
  });
  
  // test('invalid semver', async (done) => {
  //   const guestRole = await guestDomainRole();

  //   const feature = await Feature.add({ name: 'Authorization',
  //                                       domainId: siteDomain.id,
  //                                       domainRoleId: guestRole.id,
  //                                       parentId: null,
  //                                       feabSemver: '0.x.0' })
    
  //   feature.validate((err) => {
  //     expect(err).toBeNull();
  //     done();
  //   });
  // });
  
});

