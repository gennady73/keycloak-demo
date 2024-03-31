import 'dotenv/config.js';

import express from 'express';

import initRoutes from './routes/api/api.js';

import initRoutesM2M from './routes/api/api-m2m.js';

import session from 'express-session';

import initKeycloak from './config/keycloak-config.js';

import cors from 'cors';

const app = express()


/* SETTINGS */
app.set('host', process.env.NODE_HOST || '127.0.0.1')
app.set('port', process.env.NODE_PORT || 3000)
app.set('env', process.env.NODE_ENV || 'development')


/* CORS */
var whitelist = [
  'http://localhost:5000', 
  'http://localhost:8080',
  'http://localhost:3002', 
  'http://localhost:3004'
];

app.use(function (req, res, next) {
  var originIndex = whitelist.indexOf(req.header('Origin'));

  if (originIndex !== -1) { 
    res.header("Access-Control-Allow-Origin", `${req.header('Origin')}`);
    res.header("Access-Control-Allow-Headers", "Authorization, Origin, X-Requested-With, Content-Type, Accept");
    res.header("Referrer-Policy", "origin-when-cross-origin");
  }

  next();
});

var corsOptions = {
  origin: [...whitelist],
  optionsSuccessStatus: 200
};


/* KEYCLOAK */
var memoryStore = new session.MemoryStore();

app.use(session({
  secret: 'some-secret',
  resave: false,
  saveUninitialized: true,
  store: memoryStore
}));

const keycloak = initKeycloak(memoryStore);

/* MIDDLEWARE */
app.use(keycloak.middleware({
    logout: '/logout',
    admin: '/'
}));

app.use(express.json());


/* ROUTES */
const router = initRoutes(keycloak);
const routerM2M = initRoutesM2M(keycloak);

// API Routes, enable CORS handling 
app.options('/api/*', cors(corsOptions));

// API Routes, enable SSO protection

// Unprotected route example: app.use('/api/m2m', routerM2M);
app.use('/api/m2m', keycloak.protect(), routerM2M);

// Unprotected route example: app.use('/api', router);
app.use('/api', keycloak.protect(), router);

export default app
