// During the test the env variable is set to test
process.env.NODE_ENV = 'test';

import 'jest';

// Require the dev-dependencies
import { app } from '../../../server/app';
import { Domain } from '../../../server/models/Domain';
import { DomainRole } from '../../../server/models/DomainRole';
import Team from '../../../server/models/Team';
import User from '../../../server/models/User';
import { buildDomain } from '../../utils/domainBuilders'
import * as mongoose from 'mongoose';
import * as supertest from 'supertest';

// import { logger } from '../../../server/utils/logs';

jest.mock('../../../server/api/ensureAuthenticated');

// Our parent block
describe('Domains', () => {
  let mongoose_db
  
  beforeAll(async () => {
    const mongo_options = {
      useNewUrlParser: true,
      useCreateIndex: true,
      useFindAndModify: true,
    };
    mongoose_db = await mongoose.connect(process.env.MONGO_URL_TEST, mongo_options);
    
    await User.remove({});
    await Team.remove({});
    await Domain.remove({});
    await DomainRole.remove({});

    await buildDomain('Site');
    await buildDomain('Adhoc');

    this.serverAgent = supertest.agent(app);
  });
  
  afterAll(async () => {
    await User.remove({});
    await Team.remove({});
    await Domain.remove({});
    await DomainRole.remove({});
    await mongoose_db.close()
  });
  
  afterEach(async () => {
  });
  
    /*
    // import { loginCookie } from '../../utils/domainBuilders'
    // import * as cookie from 'cookie';
  beforeEach(async done => {
    let _this = this
    await loginCookie(this.serverAgent, (setCookie) => {
      _this.authCookie = cookie.parse(setCookie[0])['saas-api.sid'];
      // logger.debug(`*** loginCookie:  ${_this.authCookie}`);
      done();
    });
  });
    */

  /*
   * Test the /GET route
   */
  describe('/GET domain', () => {

    test('it should GET all the domains', async done => {
      this.serverAgent
        .get('/api/v1/domains')
        .set({ 'Cookie': `saas-api.sid=${this.authCookie}` })
        .expect(200)
        .expect('Content-Type', /json/)
        .end((err, res) => {
          if (err) return done(err);

          expect(200);
          
          const resJson = res.body;
          expect(resJson.domains.length).toBe(2);

          const d1 = resJson.domains[0]
          expect(d1.name).toBe('Adhoc');
          expect(d1.slug).toBe('adhoc');
          
          const d2 = resJson.domains[1]
          expect(d2.name).toBe('Site');
          expect(d2.slug).toBe('site');
          
          return done();
        });
    });

    test('it should GET domain by slug', async done => {
      this.serverAgent
        .get(`/api/v1/domains/adhoc`)
        .set({ 'Cookie': `saas-api.sid=${this.authCookie}` })
        .expect(200)
        .expect('Content-Type', /json/)
        .end((err, res) => {
          if (err) return done(err);

          expect(200);
          
          const resJson = res.body;
          expect(resJson.domains.length).toBe(1);

          const d1 = resJson.domains[0]
          expect(d1.name).toBe('Adhoc');
          expect(d1.slug).toBe('adhoc');
          
          return done();
        });
    });
    
  });
});
