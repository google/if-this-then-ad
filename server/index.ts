import app from './app';

/**
 * Start Express
 */
const port = 8080;
const server = app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
  console.log('ctrl + C to kill it');
});

export default server;
