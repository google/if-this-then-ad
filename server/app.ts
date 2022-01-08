import express from 'express';
import session from 'express-session';
import cors from 'cors';
import path from 'path';
import router from './routes';
import env from 'dotenv';
import passportSetup from './config/passportSetup';

// Loading env file config
const envConfig = env.config();
if (envConfig.error) {
  console.log('Error loading configuration from .env file');
  throw envConfig.error;
}

let app = express();


const config = envConfig.parsed;


const PORT = process.env.PORT || 8080;

/**
 * Express configuration
 */

app.set('port', PORT);

app.use(cors());
// Static assets & Frontend files
app.use(express.static(path.join(__dirname, './public')));

app.use(express.json());
app.use(express.urlencoded({extended: true}));

app.use(session({
  resave: true,
  saveUninitialized: true,
  secret: config.SESSION_SECRET,
}));
app = passportSetup.init(app);

app.use('/', router);

export default app;
