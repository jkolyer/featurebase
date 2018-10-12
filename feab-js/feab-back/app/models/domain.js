const mongoose = require('mongoose');
const _ = require('lodash');

let Domain = null;

const { Schema } = mongoose;

const RoleSchema = new Schema({
    name: { type: String, required: true },
    slug: { type: String, required: true },
    parent: { type: String, required: false },
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

// DomainSchema.plugin(findOrCreate);

DomainSchema.query.bySlug = function (slug) {
    return this.where({ slug });
};

DomainSchema.statics.bootstrap = function (domainData, callback) {
    const domains = [];
    const numDomain = Object.keys(domainData).length;

    _.forEach(domainData, async (value, key) => {
        const dname = value.name;
        await Domain.findOne({ slug: key }, async (err, domain) => {
            let domainObj = domain;
            if (!domainObj) {
                domainObj = new Domain({ slug: key, name: dname });

                console.log(domainObj);
                await domain.save((err2) => {
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

Domain = mongoose.model('Domain', DomainSchema);

// Exports the DomainSchema for use elsewhere.
module.exports = Domain;
