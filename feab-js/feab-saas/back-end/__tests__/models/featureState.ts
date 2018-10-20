import { Domain } from '../../server/models/Domain';
import { DomainRole } from '../../server/models/DomainRole';
import { Feature } from '../../server/models/Feature';
import * as mongoose from 'mongoose';
import * as _ from 'lodash';
import { authorizationFeature, guestDomainRole } from '../utils/featureBuilders'

describe('features state management', () => {

  beforeAll(async () => {
    await mongoose.connect(process.env.MONGO_URL_TEST);
  });
  
  beforeEach(async () => {
    await Domain.remove({});
    await DomainRole.remove({});
    await Feature.remove({});
  });
  
  test('initial state', async (done) => {
    const feature = await authorizationFeature();
    expect(feature.is())
    done();
  });
  
});
