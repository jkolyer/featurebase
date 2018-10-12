const { expect } = require('chai');
const sinon = require('sinon');
const sinonTest = require('sinon-test');
const Role = require('../../app/models/role');

const test = sinonTest(sinon);

describe('role field validation', () => {
    it('should be invalid if name is empty', (done) => {
        const rr = new Role();
        rr.validate((err) => {
            expect(err.errors.name).to.exist;
            done();
        });
    });
    it('should be invalid if feab_version is empty', (done) => {
        const rr = new Role();
        rr.validate((err) => {
            expect(err.errors.feab_version).to.exist;
            done();
        });
    });
    it('should find role with given name', test(function() {
        this.stub(Role, 'findOne');
        const expectedName = 'This name should be used in the check';
        const rr = new Role({ name: expectedName,
                              feab_version: '0.0.1',
                              order_id: 101
                            });
        rr.hasRole(() => { });
        sinon.assert.calledWith(Role.findOne, {
			name: expectedName
		});
    }));
});
