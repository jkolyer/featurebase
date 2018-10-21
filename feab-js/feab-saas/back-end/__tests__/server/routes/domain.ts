// During the test the env variable is set to test
process.env.NODE_ENV = 'test';

// Require the dev-dependencies
import { server } from '../../../server/app';
import { Domain } from '../../../server/models/Domain';
import { buildDomain } from '../../utils/domainBuilders'
import * as mongoose from 'mongoose';
import * as request from 'supertest';

import { logger } from '../../../server/utils/logs';

// import chai from 'chai';
// const should = chai.should();

// Our parent block
describe('Domains', () => {
  beforeAll(async () => {
    await mongoose.connect(process.env.MONGO_URL_TEST);
  });
  
  beforeEach(async done => { // Before each test we empty the database
    await Domain.remove({});
    done();
  });

  /*
   * Test the /GET route
   */
  describe('/GET domain', () => {
    it('it should GET all the domains', async done => {
      await buildDomain('Site');
      await buildDomain('Adhoc');
      
      request(server)
        .get('/domains')
        .end((err, res) => {
          debugger
          expect(err).toBeNull();
          logger.debug(`*** /get:  ${res}`);
          
          expect(res.statusCode).toEqual(200);
          // res.should.have.status(200);
          // res.body.should.be.a('array');
          // res.body.length.should.be.eql(2);
          done();
        });
    });
  });
});
