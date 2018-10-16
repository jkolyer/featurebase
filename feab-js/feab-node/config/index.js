'use strict';

/**
 * Module dependencies.
 */

const path = require('path');

const development = require('./env/development');
const test = require('./env/test');
const production = require('./env/production');

const notifier = {
  service: 'postmark',
  APN: false,
  email: true, // true
  actions: ['comment'],
  tplPath: path.join(__dirname, '..', 'app/mailer/templates'),
  key: 'POSTMARK_KEY'
};

const defaults = {
  root: path.join(__dirname, '..'),
  notifier: notifier
};

const domains = {
	"site": {
	  "name": "Site",
	  "roles": [{ "name": "Admin", "slug": "admin", "domain": "site" },
		          { "name": "Guest", "slug": "guest", "parent": "admin", "domain": "site" }]
	},
	"adhoc": {
	  "name": "Ad Hoc",
	  "roles": [{ "name": "Super User", "slug": "super-user", "domain": "adhoc" },
		          { "name": "Premium User", "slug": "premium-user", "parent": "super-user", "domain": "adhoc" },
		          { "name": "Basic User", "slug": "basic-user", "parent": "premium-user", "domain": "adhoc" }],
	}
};


/**
 * Expose
 */

let configs = {
    development: Object.assign({}, development, defaults),
    test: Object.assign({}, test, defaults),
    production: Object.assign({}, production, defaults),
}[process.env.NODE_ENV || 'development'];

configs['jwtSecret'] = "a secret phrase!!";
configs['domains'] = domains;

module.exports = configs;
