
import express from 'express';
import session from 'express-session';
import cors from 'cors';
import path from 'path';
import passport from 'passport';
import router from './routes';
import env from 'dotenv';
// import * as passportConfig from './config/passportConfig';
// Loading env file config
const config = env.config();
if (config.error) {
  console.log('Error loading configuration from .env file');
  throw config.error;
}

console.log('--- Configuration loaded ---');
console.log(config.parsed);

const app = express();

const PORT = process.env.PORT || 8080;

/**
 * Express configuration
 */

app.set('config', config.parsed);
app.set('port', PORT);

app.use(cors());
// Static assets & Frontend files
app.use(express.static(path.join(__dirname, './public')));

app.use(express.json());
app.use(express.urlencoded({extended: true}));

app.use(session({
  resave: true,
  saveUninitialized: true,
  secret: `${process.env.SESSION_SECRET}`,
}));
app.use(passport.initialize());
app.use(passport.session());

app.use('/', router);

export default app;
