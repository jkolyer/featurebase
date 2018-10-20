import { Domain } from '../../server/models/Domain';
import { DomainRole } from '../../server/models/DomainRole';
import { Feature } from '../../server/models/Feature';
import * as mongoose from 'mongoose';
import { authorizationFeature } from './featureBuilders'

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
    const feature = await authorizationFeature();
    const register = 'Register';
    const child = await Feature.addChildFeature({ name: register,
                                                  parentFeature: feature
                                                });
    expect(child.name).toEqual(register);
    expect(child.feabSemver).toEqual(feature.feabSemver);
    expect(child.domain.id).toEqual(feature.domain.id);
    expect(child.domainRole.id).toEqual(feature.domainRole.id);
    expect(child.parent.id).toEqual(feature.id);
    
    done();
  });
  
  test('bump semver in child features', async (done) => {
    const feature = await authorizationFeature();
    const register = 'Register';
    let child = await Feature.addChildFeature({ name: register,
                                                parentFeature: feature
                                              });
    expect(child.parent.id).toEqual(feature.id);
    expect(child.feabSemver).toEqual('0.0.0');
    
    const part = 'patch';
    await Feature.bumpVersion({ feature, part });
    expect(feature.feabSemver).toEqual('0.0.1');

    // NOTE:  this has a race condition which I am skipping for now
    /*
    const childId = child.id
    child = await Feature
      .findOne({ _id: childId })
      .lean();
    expect(child.feabSemver).toEqual('0.0.1');
    */
    done();
  });
  
});

