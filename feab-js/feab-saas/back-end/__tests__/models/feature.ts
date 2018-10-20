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

  test('increment semver', async (done) => {
    let feature = await authorizationFeature();
    
    let part = 'patch';
    const initialFeature = feature;
    feature = await Feature.bumpVersion({ feature, part, parent: null });
    expect(feature.feabSemver).toEqual('0.0.1');
    expect(feature.id).not.toEqual(initialFeature.id);
    
    part = 'minor';
    feature = await Feature.bumpVersion({ feature, part, parent: null });
    expect(feature.feabSemver).toEqual('0.1.0');
    
    part = 'patch';
    feature = await Feature.bumpVersion({ feature, part, parent: null });
    expect(feature.feabSemver).toEqual('0.1.1');
    
    part = 'major';
    feature = await Feature.bumpVersion({ feature, part, parent: null });
    expect(feature.feabSemver).toEqual('1.0.0');
    
    done();
  });
  
  test('bump semver in child features', async (done) => {
    let authorize = await authorizationFeature();
    const register = await Feature.addChildFeature({ name: 'Register',
                                                     parentFeature: authorize });
    expect(register.parent.id).toEqual(authorize.id);
    expect(register.feabSemver).toEqual('0.0.0');
    
    const confirm = await Feature.addChildFeature({ name: 'Confirmation',
                                                    parentFeature: register });
    expect(confirm.parent.id).toEqual(register.id);
    expect(confirm.feabSemver).toEqual('0.0.0');
    
    const part = 'patch';
    const authorizeBump = await Feature.bumpVersion({ feature: authorize,
                                                      part,
                                                      parent:null,
                                                    });
    expect(authorizeBump.feabSemver).toEqual('0.0.1');
    
    const children = await Feature.findChildren({ feature: authorizeBump });
    expect(children.length).toEqual(1);
    expect(children[0].name).toEqual('Register');
    expect(children[0].feabSemver).toEqual(authorizeBump.feabSemver);
    expect(children[0].id).not.toEqual(register.id);
    done();

  });
  
});

