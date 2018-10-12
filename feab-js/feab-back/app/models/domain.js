const mongoose = require('mongoose');
const _ = require('lodash');

let Domain = null;

const { Schema } = mongoose;

const RoleSchema = new Schema({
    name: { type: String, required: true },
    slug: { type: String, required: true },
    parent: { type: String, required: false },
    domain: { type: String, required: true },
}, {
    versionKey: false,
});

// domain schema definition
const DomainSchema = new Schema({
    name: { type: String, required: true },
    slug: { type: String, required: true },
    roles: [RoleSchema],
}, {
    versionKey: false,
});

DomainSchema.query.bySlug = function (slug) {
    return this.where({ slug });
};

DomainSchema.statics.bootstrap = function (domainData, callback) {
    const domains = [];
    const numDomain = Object.keys(domainData).length;

    _.forEach(domainData, async (value, key) => {
        const dname = value.name;
        const roles = value.roles
        await Domain.findOne({ slug: key }, async (err, domain) => {
            let domainObj = domain;
            if (!domainObj) {
                domainObj = new Domain({ slug: key,
                                         name: dname,
                                         roles: roles
                                       });

                console.log(domainObj);
                await domainObj.save((err2) => {
                    console.log('*** saved');
                    if (err2) {
                        console.log(`ERROR:  ${err2}`);
                    }
                });
            }
            domains.push(domainObj);

            if (domains.length === numDomain) {
                callback(domains);
            }
        });
    });
};

// NOTE this is declared at top, and referenced within the bootstrap static method
Domain = mongoose.model('Domain', DomainSchema);

module.exports = Domain;
