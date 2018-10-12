const mongoose = require('mongoose');
// const findOrCreate = require('mongoose-findorcreate');
var _ = require('lodash');
var util = require('util');

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
    roles: { RoleSchema },
}, {
    versionKey: false,
});

// DomainSchema.plugin(findOrCreate);

DomainSchema.query.bySlug = function(slug) {
    return this.where({ slug: slug });
}

DomainSchema.statics.bootstrap = function(domainData, callback) {
    let domains = []
    let numDomain = Object.keys(domainData).length
    
    _.forEach(domainData, async function(value, key) {
	const dname = value.name
	await Domain.findOne({ slug: key }, async function(err, domain) {
	    if (!domain) {
		domain = new Domain({ slug: key, name: dname })

		console.log(domain);
		await domain.save(function(err) {
		    console.log('*** saved');
		});
	    }
	    domains.push(domain);
	    
	    if (domains.length == numDomain) {
		callback(domains);
	    }
	});
    });
};

var Domain = mongoose.model('Domain', DomainSchema);

// Exports the DomainSchema for use elsewhere.
module.exports = Domain;
