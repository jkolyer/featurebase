import * as compression from 'compression';
import * as mongoSessionStore from 'connect-mongo';
import * as cors from 'cors';
import * as dotenv from 'dotenv';
import * as express from 'express';
import * as session from 'express-session';
import * as helmet from 'helmet';
import * as mongoose from 'mongoose';
import * as path from 'path';

import api from './api';
import { signRequestForLoad } from './aws-s3';
import authGoog from './google';
import { stripeWebHooks } from './stripe';

import logger from './logs';
import Team from './models/Team';

dotenv.config();

const dev = process.env.NODE_ENV !== 'production';
const port = process.env.PORT || 8000;
const devhost = process.env.NODE_IP || 'localhost';
const { PRODUCTION_URL_APP, PRODUCTION_URL_API } = process.env;
const ROOT_URL = dev ? `http://${devhost}:${port}` : PRODUCTION_URL_API;

const MONGO_URL = dev ? process.env.MONGO_URL_DEV : process.env.MONGO_URL;

const options = {
  useNewUrlParser: true,
  useCreateIndex: true,
  useFindAndModify: false,
};

mongoose.connect(
  MONGO_URL,
  options,
);

const app = express();

const appPort = process.env.APP_PORT || 3000;
const origin = dev ? `http://${devhost}:${appPort}` : PRODUCTION_URL_APP;
app.use(cors({ origin, credentials: true }));

app.use(helmet());
app.use(compression());

stripeWebHooks({ server: app });

app.use(express.json());

const MongoStore = mongoSessionStore(session);
const sessionOptions = {
  name: process.env.SESSION_NAME,
  secret: process.env.SESSION_SECRET,
  store: new MongoStore({
    mongooseConnection: mongoose.connection,
    ttl: 14 * 24 * 60 * 60, // save session 14 days
  }),
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    maxAge: 14 * 24 * 60 * 60 * 1000, // expires in 14 days
    domain: devhost,
  } as any,
};

if (!dev) {
  app.set('trust proxy', 1); // sets req.hostname, req.ip
  sessionOptions.cookie.secure = true; // sets cookie over HTTPS only
}

const sessionMiddleware = session(sessionOptions);
app.use(sessionMiddleware);

authGoog({ server: app, ROOT_URL });
api(app);

app.get('/uploaded-file', async (req, res) => {
  if (!req.user) {
    res.redirect(dev ? 'http://localhost:3000/login' : `${PRODUCTION_URL_APP}/login`);
    return;
  }

  const { path: filePath, bucket, teamSlug } = req.query;

  if (!filePath) {
    res.status(401).end('Missing required data');
    return;
  }

  if (!bucket) {
    res.status(401).end('Missing required data');
    return;
  }

  if (teamSlug) {
    const team = await Team.findOne({ slug: teamSlug })
      .select('memberIds')
      .lean();

    if (!team || !team.memberIds.includes(req.user.id)) {
      res.status(401).end('You do not have permission.');
      return;
    }
  }

  const data: any = await signRequestForLoad(filePath, bucket);

  res.redirect(data.signedRequest);
});

app.get('/robots.txt', (_, res) => {
  res.sendFile(path.join(__dirname, '../static', 'robots.txt'));
});

app.get('*', (_, res) => {
  res.sendStatus(403);
});

if (dev) {
  // development error handler will print stacktrace
  app.use((err, req, res, next) => {
    if (req && next) {
      logger.error(`*** error:  ${err.message}`);
    }
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err,
    });
  });
} else {
  app.use((err, req, res, next) => {
    if (req && next) {
      logger.error(`*** error:  ${err.message}`);
    }
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: {},
    });
  });
}

export { app, ROOT_URL };
