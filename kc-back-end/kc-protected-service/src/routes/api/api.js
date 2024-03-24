import { Router } from 'express';
import cors from 'cors';


export default function initRoutes(kc) {

  const router = Router()
  const keycloak = kc;

  router.get('/', (req, res) => {
    res.json({
      message: {
        appName: process.env.npm_package_name,
        appVer: process.env.npm_package_version
      }
    })
  });

  router.get('/messages', (req, res) => {

    res.json({
      message: 'Hello from the protected BE resource.'
    });

  });

  router.get('/user', keycloak.protect('user'), function (req, res) {

    res.send(
      JSON.stringify(JSON.parse('{"message": "Hello user from BE resource"}').message, null, 4)
    );

  });

  router.get('/admin', keycloak.protect('admin'), function (req, res) {

    res.send("Hello Admin from BE resource");

  });

  return router;

};
