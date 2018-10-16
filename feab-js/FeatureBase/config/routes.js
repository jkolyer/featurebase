'use strict';

const authCheckMiddleware = require('../server/middleware/auth-check');
const authRoutes = require('../server/routes/auth');
const apiRoutes = require('../server/routes/api');

module.exports = function (app, passport) {

    // pass the authenticaion checker middleware
    app.use('/api', authCheckMiddleware);

    // routes
    app.use('/auth', authRoutes);
    app.use('/api', apiRoutes);

};
