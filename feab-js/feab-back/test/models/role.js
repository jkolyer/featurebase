const { expect } = require('chai');
const Role = require('../../app/models/role');

describe('role', () => {
    it('should be invalid if name is empty', (done) => {
        const rr = new Role();
        rr.validate((err) => {
            expect(err.errors.name).to.exist;
            done();
        });
    });
});
