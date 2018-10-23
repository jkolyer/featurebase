import { app, ROOT_URL } from './server/app'
import logger from './server/logs';

const port = process.env.PORT || 8000;

app.listen(port, err => {
  if (err) {
    throw err;
  }
  logger.info(`> Ready on ${ROOT_URL}`);
});
