// During the test the env variable is set to test
process.env.NODE_ENV = 'test';

// Require the dev-dependencies
const chai = require('chai');
const chaiHttp = require('chai-http');
const server = require('../server');
const Role = require('../app/models/role');

chai.use(chaiHttp);

// Our parent block
describe('Roles', () => {
    beforeEach((done) => { // Before each test we empty the database
        Role.remove({}, () => {
            done();
        });
    });
    /*
     * Test the /GET route
     */
    describe('/GET role', () => {
        it('it should GET all the roles', (done) => {
            chai.request(server)
                .get('/role')
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.should.be.a('array');
                    res.body.length.should.be.eql(0);
                    done();
                });
        });
    });
    /*
     * Test the /POST route
     */
    describe('/POST role', () => {
        it('it should not POST a role without feab_version field', (done) => {
            const role = {
                name: 'admin role',
                order_id: 100,
            };
            chai.request(server)
                .post('/role')
                .send(role)
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.should.be.a('object');
                    res.body.should.have.property('errors');
                    res.body.errors.should.have.property('feab_version');
                    res.body.errors.feab_version.should.have.property('kind').eql('required');
                    done();
                });
        });
        it('it should POST a role ', (done) => {
            const role = {
                name: 'admin role',
                feab_version: '0.0.1',
                order_id: 100,
            };
            chai.request(server)
                .post('/role')
                .send(role)
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.should.be.a('object');
                    res.body.should.have.property('message').eql('Role successfully added!');
                    res.body.role.should.have.property('name');
                    res.body.role.should.have.property('feab_version');
                    res.body.role.should.have.property('order_id');
                    done();
                });
        });
    });
    /*
     * Test the /GET/:id route
     */
    describe('/GET/:id role', () => {
        it('it should GET a role by the given id', (done) => {
            const newRole = new Role({ name: 'admin', feab_version: '0.0.1', order_id: 101 });
            newRole.save((err, role) => {
                chai.request(server)
                    .get(`/role/${role.id}`)
                    .send(role)
                    .end((err2, res) => {
                        res.should.have.status(200);
                        res.body.should.be.a('object');
                        res.body.should.have.property('name');
                        res.body.should.have.property('feab_version');
                        res.body.should.have.property('order_id');
                        res.body.should.have.property('_id').eql(role.id);
                        done();
                    });
            });
        });
    });
    /*
     * Test the /PUT/:id route
     */
    describe('/PUT/:id role', () => {
        it('it should UPDATE a role given the id', (done) => {
            const newRole = new Role({ name: 'admin', feab_version: '0.0.1', order_id: 101 });
            newRole.save((err, role) => {
                chai.request(server)
                    .put(`/role/${role.id}`)
                    .send({ name: 'admin', feab_version: '0.0.1', order_id: 102 })
                    .end((err2, res) => {
                        res.should.have.status(200);
                        res.body.should.be.a('object');
                        res.body.should.have.property('message').eql('Role updated!');
                        res.body.role.should.have.property('order_id').eql(102);
                        done();
                    });
            });
        });
    });
    /*
     * Test the /DELETE/:id route
     */
    describe('/DELETE/:id role', () => {
        it('it should DELETE a role given the id', (done) => {
            const newRole = new Role({ name: 'admin', feab_version: '0.0.1', order_id: 101 });
            newRole.save((err, role) => {
                chai.request(server)
                    .delete(`/role/${role.id}`)
                    .end((err2, res) => {
                        res.should.have.status(200);
                        res.body.should.be.a('object');
                        res.body.should.have.property('message').eql('Role successfully deleted!');
                        res.body.result.should.have.property('ok').eql(1);
                        res.body.result.should.have.property('n').eql(1);
                        done();
                    });
            });
        });
    });
});
