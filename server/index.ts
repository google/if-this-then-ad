import app from './app';
import logger from './util/logger';

/**
 * Start Express
 */
const port = app.get('PORT');
const server = app.listen(port, () => {
  logger.info(`Server listening on port ${port}`);
  logger.info('ctrl + C to kill it');
});

export default server;
