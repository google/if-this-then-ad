'use strict';

const express = require('express');
const app = express();
const logger = require('./util/logger');

const port = process.env.PORT || 8080;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(require('./routes'));

app.get('/', (req, res) => {
  const name = process.env.NAME || 'World';
  res.send(`Hello ${name}! For Max and Kevin :-)`);
});

app.listen(port, () => {
  logger.info(`Listening on port ${port}`);
});
