process.env.NODE_ENV = 'test';

import 'jest';

import { app } from '../../../server/app';
import { buildDomainAndRole,
         buildDomainRole,
         setupMongoose } from '../../utils/domainBuilders'
import * as supertest from 'supertest';

// import { logger } from '../../../server/utils/logs';

jest.mock('../../../server/api/ensureAuthenticated');

describe('Domain Roles', () => {
  const docRefs: any = {};
  
  beforeAll(async () => {
    setupMongoose(true);
    
    const superRole = await buildDomainAndRole('Adhoc', 'Super User');
    const adhocDomain = superRole.domain;
    const premiumRole = await buildDomainRole('Premium User', adhocDomain, superRole);
    const basicRole = await buildDomainRole('Basic User', adhocDomain, premiumRole);

    docRefs.adhocDomain = adhocDomain;
    docRefs.superRole = superRole;
    docRefs.premiumRole = premiumRole;
    docRefs.basicRole = basicRole;
    
    const guestRole = await buildDomainAndRole('Site', 'Guest');
    docRefs.siteDomain = guestRole.domain
    
    await buildDomainRole('User', docRefs.siteDomain, null);
    // logger.debug(`*** beforeAll:  ${userRole}`)
    
    this.serverAgent = supertest.agent(app);
  });
  
  afterAll(async () => {
    setupMongoose(false);
  });
  
  describe('domain-role parent-child', () => {
    test('it should have parent-child relationships', async done => {
      expect(docRefs.superRole.parent).toBe(null);
      expect(docRefs.premiumRole.parent).toBe(docRefs.superRole);
      expect(docRefs.basicRole.parent).toBe(docRefs.premiumRole);
      done();
    });
  });
  
  describe('/GET domain-role', () => {
    test('it should GET all the domain roles', async done => {
      this.serverAgent
        .get(`/api/v1/domains/${docRefs.siteDomain.id}/roles`)
        .expect(200)
        .expect('Content-Type', /json/)
        .end((err, res) => {
          if (err) return done(err);
          expect(200);

          const result = res.body

          const domain = result.domain;
          expect(domain).not.toBe(null);
          expect(domain.name).toBe('Site');
          
          const roles = result.roles;
          expect(roles.length).toBe(2);
          
          expect(roles[0].name).toBe('Guest');
          expect(roles[1].name).toBe('User');
          
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
