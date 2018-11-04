// During the test the env variable is set to test
process.env.NODE_ENV = 'test';

// Require the dev-dependencies
import { app } from '../../../server/app';
import { Domain } from '../../../server/models/Domain';
import { DomainRole } from '../../../server/models/DomainRole';
import { buildDomain, loginCookie, owner } from '../../utils/domainBuilders'
import * as mongoose from 'mongoose';
import * as request from 'supertest';

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
    
    this.authenticate = sinon.stub(passport,"authenticate")
      .callsFake((strategy, options) => {
        logger.debug(`*** callsFake:  ${strategy}; ${options}`);
        
        return (req, res, next) => {
          if (req && res && next) {
            req.user = this.user;
            logger.debug('*** authenticate: ');
            res.redirect(`/`);
          }
        };
      });

    let _this = this
    await loginCookie(serverAgent, (cookie) => {
      _this.authCookie = cookie;
    });
    logger.debug(`*** loginCookie: assigned  ${this.authCookie}`);
  });
  
  afterAll(async () => {
    this.authenticate.restore();
  });
  
  afterEach(async () => {
    await Domain.remove({});
    await DomainRole.remove({});
  });
  
  beforeEach(async done => {
    await buildDomain('Site');
    await buildDomain('Adhoc');

    this.user = await owner()
    this.userId = this.user.id;

    done();
  });

  function loginUser() {
    return function(done) {
      serverAgent
        .get('/auth/google')
        .expect(302)
        .expect('Location', '/')
        .end(onResponse);

      function onResponse(err, res) {
        if (err) return done(err);
        this.cookies = res.headers['set-cookie'];
        
        logger.debug(`*** loginUser: res = ${res}`);
        return done();
      }
    };
  };
  
  /*
   * Test the /GET route
   */
  describe('/GET domain', () => {
    test('login', loginUser());

    test('it should GET all the domains', async done => {
      logger.debug(`*** get all domains:  cookie = ${this.authCookie}`);
      
      serverAgent
        .get('/api/v1/team-leader')
        .expect(200)
        .end(onResponse);

      function onResponse(err, res) {
        if (err) return done(err);
        logger.debug(`*** loginUser: res = ${res}`)
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
