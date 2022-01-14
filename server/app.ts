import express from 'express';
import session from 'express-session';
import cors from 'cors';
import path from 'path';
import router from './routes';
import bodyParser from 'body-parser';
import env from 'dotenv';
import PassportSetup from './config/PassportSetup';
import log from './util/logger';
// Loading env file config
const envConfig = env.config();
if (envConfig.error || envConfig.parsed == null) {
  log.error('Error loading configuration from .env file');
  throw envConfig.error;
}

let app = express();
const config = envConfig.parsed;

log.info(`LOG LEVEL SETTING : ${process.env.LOG_LEVEL}`);
log.debug(`Loaded configuration : ${JSON.stringify(config, null, 2)}`);
const PORT = process.env.PORT || 8080;
app.set('PORT', PORT);
/**
 * Express configuration
 */
app.use(cors());
// Static assets & Frontend files
app.use(express.static(path.join(__dirname, './public')));
app.use(express.json());

// Process any request body as JSON, throw error if JSON is not correct
app.use(bodyParser.json({type: '*/*'}));
app.use(express.urlencoded({extended: true}));

app.use(
    session({
      resave: true,
      saveUninitialized: true,
      secret: process.env.SESSION_SECRET || 's9hp0VtUkd$FJM$T91lB',
    }),
);
app = PassportSetup.init(app);

app.use('/', router);

export default app;
