import { response, Router } from 'express';
import cors from 'cors';
import axios from 'axios';
/* 
 * Optional, will be in use for demonstration of multi-client case:
 *
 * import initKeycloakM2M from '../../config/keycloak-config-m2m.js';
 */


function getFromM2M(url, token) {

  const config = {
    "headers": {
      "Authorization": "Bearer " + token,
      "Referrer-Policy": "origin-when-cross-origin",
      "X-Forwarded-Access-Token": token,
      "Cache-Control": "no-cache",
      'Accept': '*/*'
    },
    "crossDomain": true,
    "mode": "cors",
    "timeout": 100000, /* the value is intentionally too big for demo use. */
  }

  try {
    var response = axios.get(url, config);
    console.log(response);
    return response;
  } catch (error) {
    console.error(error);
    return error;
  }

}

export default function initRoutes(kc) {

  const router = Router()
  const keycloak = kc;
  /* 
   * Optional, will be in use for demonstration of multi-client case:
   *
   * const keycloakM2M = initKeycloakM2M();
   */
  
   router.get('/', (req, res) => {
    res.json({
      message: {
        appName: process.env.npm_package_name,
        appVer: process.env.npm_package_version
      }
    })
  });

  router.get('/messages', (req, res) => {
  /* 
   * Optional, will be in use for demonstration of multi-client case:
   *
   * keycloakM2M.grantManager.obtainFromClientCredentials()
   * .then((grant)=>{
   *     console.log(`grant : ${grant}`);
   * });
   */

    res.json({
      message: 'Response from the protected BEE resource.'
    });

  });

  router.get('/user', keycloak.protect('user'), function (req, res) {
    const access_token = (req.kauth && req.kauth.grant)? req.kauth.grant.access_token: undefined;

    getFromM2M("http://localhost:3004/api/user", access_token.token)
    .then(function (response) {
      console.log(`Response from M2M: ${response.status}`);
      res.send(
        JSON.stringify(JSON.parse(`{"message": "${response.data}"}`).message, null, 2)
      );
    })
    .catch((e) => {
      var err_msg  = e.message.replace('\n','');
      console.error(`Response error from M2M: ${err_msg}`);
      res.send(
        JSON.stringify(JSON.parse(`{"message": "${err_msg}"}`).message, null, 2)
      );
    });

  });

  router.get('/admin', keycloak.protect('admin'), function (req, res) {
    const access_token = (req.kauth && req.kauth.grant)? req.kauth.grant.access_token: undefined;

    getFromM2M("http://localhost:3004/api/admin", access_token.token)
    .then(function (response) {
      console.log(`Response from M2M: ${response.status}`);
      res.send(
        JSON.stringify(JSON.parse(`{"message": "${response.data}"}`).message, null, 2)
      );
    })
    .catch((e) => {
      var err_msg  = e.message.replace('\n','');
      console.error(`Response error from M2M: ${err_msg}`);
      res.send(
        JSON.stringify(JSON.parse(`{"message": "${err_msg}"}`).message, null, 2)
      );
    });

  });

  /* 
   * Optional, will be in use for demonstration of multi-client case:
   *
   * router.get('/users', keycloakM2M.protect('user'), function (req, res) {  ...
   */
  router.get('/users', keycloak.protect('user'), function (req, res) {
    const access_token = (req.kauth && req.kauth.grant)? req.kauth.grant.access_token: undefined;

    getFromM2M("http://localhost:3004/api/users", access_token.token)
    .then(function (response) {
      console.log(`Response from M2M: ${response.status}`);
      res.send(
        JSON.stringify(response.data, null, 4)
      );
    })
    .catch((e) => {
      var err_msg  = e.message.replace('\n','');
      console.error(`Response error from M2M: ${err_msg}`);
      res.status(503).send(
        JSON.stringify(JSON.parse(`{"message": "[${err_msg}]"}`).message, null, 4)
      );
    });

  });

  return router;

};
