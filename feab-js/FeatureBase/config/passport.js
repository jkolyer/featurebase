'use strict';

/*!
 * Module dependencies.
 */

const local = require('./passport/local');
const google = require('./passport/google');
const facebook = require('./passport/facebook');
const twitter = require('./passport/twitter');
const linkedin = require('./passport/linkedin');
const github = require('./passport/github');

const localSignupStrategy = require('../server/passport/local-signup');
const localLoginStrategy = require('../server/passport/local-login');

/**
 * Expose
 */

module.exports = function (passport) {
    passport.use('local-signup', localSignupStrategy);
    passport.use('local-login', localLoginStrategy);
    // passport.use(local);
    
  passport.use(google);
  passport.use(facebook);
  passport.use(twitter);
  passport.use(linkedin);
  passport.use(github);
};
