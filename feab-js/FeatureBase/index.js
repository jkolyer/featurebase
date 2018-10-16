require('dotenv').config();

const { join } = require('path');
const express = require('express');
const passport = require('passport');
const config = require('./config');

const models = join(__dirname, 'app/models');
// connect to the database and load models
require('./server/models').connect(config.db);

const app = express();

// Bootstrap routes
require('./config/passport')(app, passport);


// tell the app to look for static files in these directories
app.use(express.static('./server/static/'));
app.use(express.static('./client/dist/'));

// tell the app to parse HTTP body messages
app.use(express.urlencoded({ extended: false }));

// pass the authenticaion checker middleware
const authCheckMiddleware = require('./server/middleware/auth-check');
app.use('/api', authCheckMiddleware);

// routes
const authRoutes = require('./server/routes/auth');
const apiRoutes = require('./server/routes/api');
app.use('/auth', authRoutes);
app.use('/api', apiRoutes);

// Set Port, hosting services will look for process.env.PORT
app.set('port', (process.env.PORT || 3000));

// start the server
app.listen(app.get('port'), () => {
  console.log(`Server is running on port ${app.get('port')}`);
});
