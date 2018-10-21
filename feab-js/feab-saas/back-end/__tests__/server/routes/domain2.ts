// During the test the env variable is set to test
process.env.NODE_ENV = 'test';

// Require the dev-dependencies
import { server } from '../../../server/app';
import { Domain } from '../../../server/models/Domain';
import { buildDomain } from '../../utils/domainBuilders'
import * as mongoose from 'mongoose';
import * as request from 'supertest';

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
          expect(err).toBeNull();
          res.should.have.status(200);
          res.body.should.be.a('array');
          res.body.length.should.be.eql(2);
          done();
        });
    });
  });
  /*
   * Test the /POST route
   */
  describe('/POST domain', () => {
    it('it should not POST a domain without feab_version field', (done) => {
      const domain = {
        name: 'admin domain',
        order_id: 100,
      };
      request(server)
        .post('/domain')
        .send(domain)
        .end((err, res) => {
          expect(err).toBeNull();
          res.should.have.status(200);
          res.body.should.be.a('object');
          res.body.should.have.property('errors');
          res.body.errors.should.have.property('feab_version');
          res.body.errors.feab_version.should.have.property('kind').eql('required');
          done();
        });
    });
    it('it should POST a domain ', (done) => {
      const domain = {
        name: 'admin domain',
        feab_version: '0.0.1',
        order_id: 100,
      };
      request(server)
        .post('/domain')
        .send(domain)
        .end((err, res) => {
          expect(err).toBeNull();
          res.should.have.status(200);
          res.body.should.be.a('object');
          res.body.should.have.property('message').eql('Domain successfully added!');
          res.body.domain.should.have.property('name');
          res.body.domain.should.have.property('feab_version');
          res.body.domain.should.have.property('order_id');
          done();
        });
    });
  });
  /*
   * Test the /GET/:id route
   */
  describe('/GET/:id domain', () => {
    it('it should GET a domain by the given id', (done) => {
      const newDomain = new Domain({ name: 'admin', feab_version: '0.0.1', order_id: 101 });
      newDomain.save((err, domain) => {
        expect(err).toBeNull();
        request(server)
          .get(`/domain/${domain.id}`)
          .send(domain)
          .end((err2, res) => {
            expect(err2).toBeNull();
            res.should.have.status(200);
            res.body.should.be.a('object');
            res.body.should.have.property('name');
            res.body.should.have.property('feab_version');
            res.body.should.have.property('order_id');
            res.body.should.have.property('_id').eql(domain.id);
            done();
          });
      });
    });
  });
  /*
   * Test the /PUT/:id route
   */
  describe('/PUT/:id domain', () => {
    it('it should UPDATE a domain given the id', (done) => {
      const newDomain = new Domain({ name: 'admin', feab_version: '0.0.1', order_id: 101 });
      newDomain.save((err, domain) => {
        expect(err).toBeNull();
        request(server)
          .put(`/domain/${domain.id}`)
          .send({ name: 'admin', feab_version: '0.0.1', order_id: 102 })
          .end((err2, res) => {
            expect(err2).toBeNull();
            res.should.have.status(200);
            res.body.should.be.a('object');
            res.body.should.have.property('message').eql('Domain updated!');
            res.body.domain2.should.have.property('order_id').eql(102);
            done();
          });
      });
    });
  });
  /*
   * Test the /DELETE/:id route
   */
  describe('/DELETE/:id domain', () => {
    it('it should DELETE a domain given the id', (done) => {
      const newDomain = new Domain({ name: 'admin', feab_version: '0.0.1', order_id: 101 });
      newDomain.save((err, domain) => {
        expect(err).toBeNull();
        request(server)
          .delete(`/domain/${domain.id}`)
          .end((err2, res) => {
            expect(err2).toBeNull();
            res.should.have.status(200);
            res.body.should.be.a('object');
            res.body.should.have.property('message').eql('Domain successfully deleted!');
            res.body.result.should.have.property('ok').eql(1);
            res.body.result.should.have.property('n').eql(1);
            done();
          });
      });
    });
  });
});
