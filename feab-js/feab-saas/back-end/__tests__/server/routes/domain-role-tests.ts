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
    docRefs.guestRole = guestRole;
    docRefs.siteDomain = guestRole.domain;
    
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
      
      expect(docRefs.superRole.domain).toBe(docRefs.adhocDomain);
      
      expect(docRefs.guestRole.parent).toBe(null);
      
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

    test('it should GET specific domain role', async done => {
      this.serverAgent
        .get(`/api/v1/domains/${docRefs.adhocDomain.id}/roles/${docRefs.superRole.id}`)
        .expect(200)
        .expect('Content-Type', /json/)
        .end((err, res) => {
          if (err) return done(err);
          expect(200);

          const result = res.body

          const domain = result.domain;
          expect(domain.name).toBe('Adhoc');

          const role = result.role;
          expect(role.name).toBe('Super User');
          
          return done();
        });
    });
  });

  describe('/POST domain role', () => {
    test('it should POST new domain role with name', async done => {
      this.serverAgent
        .post(`/api/v1/domains/${docRefs.siteDomain.id}/roles`)
        .send({ name: 'Bot', parentId: docRefs.guestRole.id })
        .expect(200)
        .expect('Content-Type', /json/)
        .end((err, res) => {
          if (err) return done(err);
          expect(200);
          
          const result = res.body
          const domain = result.domain;
          expect(domain.name).toBe('Site');

          const role = result.role;
          expect(role.name).toBe('Bot');
          expect(role.parent).toBe(docRefs.guestRole.id);
          
          return done();
        });
    });
  });

  describe('/PUT domain role', () => {
    test('it should PUT new domain-role ', async done => {
      const putUrl = `/api/v1/domains/${docRefs.siteDomain.id}/roles/${docRefs.guestRole.id}`
      this.serverAgent
        .put(putUrl)
        .send({ name: 'Visitor' })
        .expect(200)
        .expect('Content-Type', /json/)
        .end((err, res) => {
          if (err) return done(err);
          expect(200);
          
          const result = res.body;
          const role = result.role;
          expect(role.name).toBe('Visitor');
          expect(role.parent).toBe(null);
          
          return done();
        });
    });    
  });
  
  /*
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
