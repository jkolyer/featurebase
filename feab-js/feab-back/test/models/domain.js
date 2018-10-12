const { expect } = require('chai');
const sinon = require('sinon');
const sinonTest = require('sinon-test');
const Domain = require('../../app/models/domain');
const config = require('config');
const mongoose = require('mongoose');

const test = sinonTest(sinon);

describe('domain field validation', () => {
    before(function() {
        mongoose.connect(config.DBHost);
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
        Domain.bootstrap(config.Domain, (domains) => {
            expect(domains.length).to.eq(2);
            done();
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
