import env from '../env';

export default function getRootUrl() {
  const port = process.env.API_PORT || 8000;
  const dev = process.env.NODE_ENV !== 'production';
  const devhost = process.env.NODE_IP || 'localhost';
  const { PRODUCTION_URL_API } = env;
  const ROOT_URL = dev ? `http://${devhost}:${port}` : PRODUCTION_URL_API;

  return ROOT_URL;
}
