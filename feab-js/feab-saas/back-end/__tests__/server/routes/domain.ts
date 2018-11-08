// During the test the env variable is set to test
process.env.NODE_ENV = 'test';

// Require the dev-dependencies
import { app } from '../../../server/app';
import { Domain } from '../../../server/models/Domain';
import { DomainRole } from '../../../server/models/DomainRole';
import { buildDomain, loginCookie, owner } from '../../utils/domainBuilders'
import * as mongoose from 'mongoose';
import * as request from 'supertest';
import * as cookie from 'cookie';

const serverAgent = request.agent(app);

import { logger } from '../../../server/utils/logs';

import * as sinon from "sinon";
import * as passport from 'passport';

// Our parent block
describe('Domains', () => {
  
  beforeAll(async () => {
    await mongoose.connect(process.env.MONGO_URL_TEST);
    
    await Domain.remove({});
    await DomainRole.remove({});

    await buildDomain('Site');
    await buildDomain('Adhoc');

    this.user = await owner()
    this.userId = this.user.id;

    const localUser = this.user
    this.authenticate = sinon.stub(passport,"authenticate")
      .callsFake((strategy, options) => {
        logger.debug(`*** callsFake:  ${strategy}; ${options}`);

        return (req, res, next) => {
          if (req && res && next) {
            req.user = localUser;
            req._passport.session = {};
            req._passport.session.user = localUser;
            if (!req.session) {
              req.session = {};
            }
            res.redirect(`/`);
          }
        };
      });

  });
  
  afterAll(async () => {
    this.authenticate.restore();
  });
  
  afterEach(async () => {
    // await Domain.remove({});
    // await DomainRole.remove({});
  });
  
  beforeEach(async done => {
    // await buildDomain('Site');
    // await buildDomain('Adhoc');
    // this.user = await owner()
    // this.userId = this.user.id;

    let _this = this
    await loginCookie(serverAgent, (setCookie) => {
      _this.authCookie = cookie.parse(setCookie[0])['saas-api.sid'];
      logger.debug(`*** loginCookie:  ${_this.authCookie}`);
      done();
    });
    
  });

  /*
   * Test the /GET route
   */
  describe('/GET domain', () => {

    test('it should GET all the domains', async done => {
      logger.debug(`*** get all domains:  cookie = ${this.authCookie}`);
      debugger
      
      serverAgent
        .get('/api/v1/team-leader')
        .set({ 'Cookie': `saas-api.sid=${this.authCookie}` })
        .expect(200)
        .end(onResponse);

      function onResponse(err, res) {
        if (err) return done(err);
        logger.debug(`*** domain request: res = ${JSON.stringify(res,null,2)}`)
        //expect(res.status).to.equal(200);
        return done();
      }
      /*
      const response = await request(serverAgent)
        .get('/api/v1/team-leader/teams/get-members');
      
      // const response = await request(app).get('/api/v1/domains');
      logger.debug(`*** /get:  ${response}`);
      expect(response.statusCode).toBe(200);
      done();
      */
    });
  });
});
