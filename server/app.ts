'use strict';
import express from 'express';
import path from 'path';
import router from './routes';
import bodyParser from 'body-parser';
const app = express();

const PORT = process.env.PORT || 8080;

/**
 * Express configuration
 */
app.set('port', PORT);

// Static assets & Frontend files
app.use(express.static(path.join(__dirname, './public')));

// Process any request body as JSON, throw error if JSON is not correct
app.use(bodyParser.json({type: "*/*"}));
app.use(express.urlencoded({extended: true}));
app.use('/', router);

export default app;
