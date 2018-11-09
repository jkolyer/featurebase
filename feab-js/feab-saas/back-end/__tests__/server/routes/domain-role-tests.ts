process.env.NODE_ENV = 'test';

import 'jest';

import { app } from '../../../server/app';
import { buildDomainAndRole,
         buildDomainRole,
         setupMongoose } from '../../utils/domainBuilders'
import * as supertest from 'supertest';

import { logger } from '../../../server/utils/logs';

jest.mock('../../../server/api/ensureAuthenticated');

describe('Domains', () => {
  let siteDomain;
  
  beforeAll(async () => {
    setupMongoose(true);
    
    const guestRole = await buildDomainAndRole('Site', 'Guest');
    siteDomain = guestRole.domain
    const userRole = await buildDomainRole('User', siteDomain, null);
    logger.debug(`*** beforeAll:  ${userRole}`)
    
    this.serverAgent = supertest.agent(app);
  });
  
  afterAll(async () => {
    setupMongoose(false);
  });
  
  describe('/GET domain-role', () => {
    test('it should GET all the domain roles', async done => {
      this.serverAgent
        .get(`/api/v1/domains/${siteDomain.id}/roles`)
        .expect(200)
        .expect('Content-Type', /json/)
        .end((err, res) => {
          if (err) return done(err);
          expect(200);
          
          const domain = res.body.domain;
          expect(domain).not.toBe(null);
          
          return done();
        });
    });
  });
  /*
  describe('/POST domain', () => {
    test('it should POST new domain with name', async done => {
      this.serverAgent
        .post(`/api/v1/domains`)
        .send({ name: 'Muh Domain' })
        .expect(200)
        .expect('Content-Type', /json/)
        .end((err, res) => {
          if (err) return done(err);
          expect(200);
          
          const d1 = res.body;
          expect(d1).not.toBe(null);
          expect(d1.name).toBe('Muh Domain');
          expect(d1.slug).toBe('muh-domain');
          
          return done();
        });
    });
  });

  describe('/PUT domain', () => {
    test('it should PUT new domain name', async done => {
      const putUrl = `/api/v1/domains/${siteDomain._id}`
      this.serverAgent
        .put(putUrl)
        .send({ name: 'Muh Site' })
        .expect(200)
        .expect('Content-Type', /json/)
        .end((err, res) => {
          if (err) return done(err);
          expect(200);
          
          const { domain } = res.body;
          expect(domain).not.toBe(null);
          expect(domain.name).toBe('Muh Site');
          expect(domain.slug).toBe('muh-site');
          
          return done();
        });
    });    
  });
  
  describe('/DELETE domain', () => {
    test('it should DELETE domain', async done => {
      this.serverAgent
        .post(`/api/v1/domains`)
        .send({ name: 'Temporary Domain' })
        .expect(200)
        .expect('Content-Type', /json/)
        .end((err, res) => {
          if (err) return done(err);
          expect(200);
          
          let domain = res.body;
          const domainId = domain._id
          
          this.serverAgent
            .delete(`/api/v1/domains/${domainId}`)
            .expect(200)
            .expect('Content-Type', /json/)
            .end((err, res) => {
              if (err) return done(err);
              expect(200);
              
              domain = res.body.domain;
              expect(domain._id).toBe(domainId);
              
              return done();
            });
        });
    });
  });
  */
});
