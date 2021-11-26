'use strict';
import express from 'express';
import path from 'path';
import router from './routes';
const app = express();

const PORT = process.env.PORT || 8080;

/**
 * Express configuration
 */
app.set('port', PORT);

// Static assets & Frontend files
app.use(express.static(path.join(__dirname, './static')));

app.use(express.json());
app.use(express.urlencoded({extended: true}));
app.use('/', router);

export default app;
