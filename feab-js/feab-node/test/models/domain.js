const { expect } = require('chai');
const sinon = require('sinon');
const sinonTest = require('sinon-test');
const Domain = require('../../server/models/domain');
const config = require('../../config');
const mongoose = require('mongoose');
const _ = require('lodash');

const test = sinonTest(sinon);

describe('domain field validation', () => {
    before(function() {
        mongoose.connect(config.db);
    });
    it('should be invalid if name is empty', (done) => {
        const rr = new Domain();
        rr.validate((err) => {
            expect(err.errors.name).to.exist;
            done();
        });
    });
    it('should be invalid if slug is empty', (done) => {
        const rr = new Domain();
        rr.validate((err) => {
            expect(err.errors.slug).to.exist;
            done();
        });
    });
    it('should create from bootstrapping', (done) => {
        Domain.remove({}, function() {
	    // NOTE:  this uses the default config/default.json definition
            Domain.bootstrap(config.domains, (domains) => {
                expect(domains.length).to.eq(2);

		_.forEach(domains, (domain) => {
		    if (domain.slug === 'site') {
			expect(domain.roles.length).to.eq(2);
		    } else if (domain.slug === 'adhoc') {
			expect(domain.roles.length).to.eq(3);
		    }
		    _.forEach(domain.roles, (role) => {
			expect(role.domain).to.eq(domain.slug);
		    });
		});
		
                done();
            });
        });
    });
    
    /*
    it('should find domain with given name', test(function() {
        this.stub(Domain, 'findOne');
        const expectedName = 'This name should be used in the check';
        const rr = new Domain({ name: expectedName,
                              feab_version: '0.0.1',
                              order_id: 101
                            });
        rr.hasDomain(() => { });
        sinon.assert.calledWith(Domain.findOne, {
			name: expectedName
		});
    }));
    */
});
