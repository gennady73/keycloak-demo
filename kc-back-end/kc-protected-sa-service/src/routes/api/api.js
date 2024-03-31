import { Router } from 'express';
import cors from 'cors';
import axios from 'axios';

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
      message: 'Hello from the protected SA BE resource.'
    });

  });

  router.get('/user', keycloak.protect('user'), function (req, res) {

    res.send(
        JSON.stringify(JSON.parse('{"message": "Hello user from SA BE resource"}').message, null, 4)
    );

  });

  router.get('/admin', keycloak.protect('admin'), function (req, res) {

    res.send("Hello Admin from SA BE resource");

  });

  /* 
   * GET ALL USERS IN REALM 
   * The access to the REST API of Keycloak, requires the following:
   * 
   * url - The API destination: `${keycloakUri}/auth/admin/realms/${keycloakRealm}/users`
   * token - The access token of service account with apropriate premissions.
   *
   * For example:
   *   const grant_access_token = grant.access_token.token;
   *   const keycloakUri = 'http://localhost:8080';
   *   const keycloakRealm = 'keycloak-demo';
   *   const url = `${keycloakUri}/auth/admin/realms/${keycloakRealm}/users`;
   *     
   *   getUsers(url, grant_access_token)
   */
  async function getUsers(url, token) {
    try {
      const response = await axios.get(url,
      {
        headers: {
          'Authorization': `bearer ${token}`
        }
      });
      console.log(response);
      return response;
    } catch (error) {
      console.error(error);
      return error;
    }
  }

  router.get('/users', keycloak.protect(), function (req, res) {

    keycloak.grantManager.obtainFromClientCredentials()
    .then((grant)=>{
  
      if (!grant.access_token) {

        msg = 'Failed to get grant.access_token';
        console.log(msg);
        res.send(
          JSON.stringify(JSON.parse(`{"message": "${msg}"}`).message, null, 2),
        );
      }
      else {

        const grant_access_token = grant.access_token.token;
        console.log(`ACCESS_TOKEN: ${grant_access_token}`);
        
        const keycloakUri = 'http://localhost:8080';
        const keycloakRealm = 'keycloak-demo';
        const url = `${keycloakUri}/auth/admin/realms/${keycloakRealm}/users`;
  
        getUsers(url, grant_access_token)
          .then((kcUsers) => {
            console.log(kcUsers.data);
            if (kcUsers.status && kcUsers.status == 200) { // ok
              res.send(
                JSON.stringify(kcUsers.data, null, 2),
              );
            }
            else if (kcUsers.response && kcUsers.response.status == 403) { // Access denied
              res.send(
                JSON.stringify(JSON.parse('{"message": "Access denied"}').message, null, 2),
              );
              return kcUsers;
            }
            else { // any other
              res.send(
                JSON.stringify(JSON.parse('{"message": "Error"}').message, null, 2),
              );
              return kcUsers;
            }

            return kcUsers;
            
          })
          .catch((e) => {
            var err_msg  = e.message.replace('\n','');
            console.error(`Error response from SA: ${err_msg}`);
            res.send(
              JSON.stringify(JSON.parse(`{"message": "${err_msg}"}`).message, null, 2)
            );
          });
      }
    })
    .catch((e) => {
      var err_msg  = e.message.replace('\n','');
      console.error(`Error response from SA: ${err_msg}`);
      res.send(
        JSON.stringify(JSON.parse(`{"message": "${err_msg}"}`).message, null, 4)
      );
    });

  });

  return router;

};
