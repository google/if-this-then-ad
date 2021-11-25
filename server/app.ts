'use strict';

const express = require('express');
const app = express();

const PORT = process.env.PORT || 8080;

/**
 * Express configuration
 */
app.set('port', PORT);

// Static assets & Frontend files
app.use('/', express.static('./static'));

app.use(express.json());
app.use(express.urlencoded({extended: true}));
app.use(require('./routes'));

export default app;
