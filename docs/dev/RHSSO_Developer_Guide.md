# <a name="_4b0ws9xh4uh7"></a>**RHSSO Developers guide (for applications)**
#### October 2023
-------------------------------------------------------------------

This guide starts from the point where the **Red Hat SSO**(RHSSO) server is up and running.

Note that the RHSSO server wraps another product named **Keycloak**, so further explanations will be provided as interaction with Keycloak for simplicity. 

## <a name="_eo65nss1zybc"></a>**Terminology**
Before diving into the code, let’s overview some definitions that are required for better understanding of authentication/authorization mechanisms and flows, which in turn will be reflected in coding approaches.
### <a name="_tyx68z8nm5m1"></a>Realm
A realm is a domain(or a namespace) in which several types of entities can be defined, the most prominent being:

See also the corresponding section in the [RHSSO Configuration Guide](/docs/keycloak/RHSSO_Configuration_Guide.md#_tyx68z8nm5m1)

- **Users:** basic entities that are allowed access to a Keycloak-secured system.
- **Roles:** a user’s authorization level, such as “admin”, “manager”, “reader” and etc.
- **Clients:** browser apps and web services that are allowed to request a login.
- **Identity Providers:** external providers to integrate with, such as Google, Facebook, or any system which implements an “OpenID Connect” authentication protocol based on the OAuth2 framework(RFC 6749 and 6750).
### <a name="_lw1mvxslii8u"></a>Token
The OAuth2 clients (front-end applications) can obtain access tokens from the server and use these same tokens to access resources protected by a resource server (back-end services). 

See also the corresponding section in the [RHSSO Configuration Guide](/docs/keycloak/RHSSO_Configuration_Guide.md#_lw1mvxslii8u)

Keycloak Authorization Services provide extensions to OAuth2 to allow access tokens to be issued based on the processing of all policies associated with the resource(s) or scope(s) being requested. This means that resource servers can enforce access to their protected resources based on the permissions granted by the server and held by an access token. In Keycloak Authorization Services the access token with permissions is called a Requesting Party Token or RPT for short.

For example,
The front-end application uses an OAuth2 client in order to authenticate against a Keycloak and in turn obtain an access token with permissions. This token will be used by the front-end to access resources protected by a back-end service.
### <a name="_kqkwmthnxq0w"></a>Authorization flows (Grant Type)
The OAuth 2.0 protocol describes four possible authorization flows while each of them has a particular use case.

See also the corresponding section in the [RHSSO Configuration Guide](/docs/keycloak/RHSSO_Configuration_Guide.md#_kqkwmthnxq0w)

- **Authorization Code Grant:** used by server side applications.

- **Implicit Grant:** used by mobile or web applications(e.g: SPA), or by any other applications that run on the user's device (User Agent).
  In this flow, the Access Token is passed on to the User Agent, *potentially making the Access Token accessible to unauthorized parties*. It’s use is valid, but not recommended and where possible you should use the Authorization Code Grant with Proof Key for Code Exchange (PKCE), which is an extension of the Authorization Code Grant and described in a separate specification (RFC 7636).

- **Resource Owner Password Credentials Grant:** used by applications considered highly secure (trusted) since the user's credentials pass through the application itself. It is typically used in legacy or migration applications. 
  The specification itself says in paragraph 10.7 that it is an *anti‑pattern* compared to what the protocol itself tries to avoid: the user must grant his credentials to the client who will impersonate him.

- **Client Credentials Grant:** used for API access through machine-to machine(M2M) interaction.


### <a name="_bmj3xja4u5wb"></a>Keycloak client
Clients are browser apps and web services that are either allowed to initiate the login process or have been provided with tokens resulting from earlier logins. The exception is the Bearer-only client which is intended for M2M interactions.

See also the corresponding section in the [RHSSO Configuration Guide](/docs/keycloak/RHSSO_Configuration_Guide.md#_bmj3xja4u5wb)

### <a name="_mjiw3l66l0ve"></a>Access Type
Client Access Type may be one of three possible values:

- **Bearer-only** – this is for services that rely solely on the bearer token included in the request and never initiate login on their own. It’s typically used for securing the back-end.
- **Confidential** – clients of this type need to provide a secret in order to initiate the login process.
- **Public** – since we have no real way of hiding the secret in a JS-based browser app, this is what we need to stick with in the front-end applications.

See also the corresponding section in the [RHSSO Configuration Guide](/docs/keycloak/RHSSO_Configuration_Guide.md#_mjiw3l66l0ve)

### <a name="_vpwlf8wqc5o7"></a>Valid Redirect URIs
This is the URI pattern (one or more) which the browser can redirect to after completing the login process.
See also the corresponding section in the [RHSSO Configuration Guide](/docs/keycloak/RHSSO_Configuration_Guide.md#_vpwlf8wqc5o7)


### <a name="_kfvr2y9ayb5f"></a>Web Origins
Governs CORS requests.
For the CORS nandling by the Keycloak, see the corresponding section in the [RHSSO Configuration Guide](/docs/keycloak/RHSSO_Configuration_Guide.md#_kfvr2y9ayb5f)

The **Referrer-Policy** HTTP header controls how much referrer information (sent with the Referer header) should be included with requests. 

**origin-when-cross-origin** : It sends complete URL information when making requests on same origin but only origin information when making cross-origin requests.

Front-end application CORS handling:
```js
// KeycloakInterceptor.js
    axiosInstance.interceptors.request.use(
        async config => {
          // ...

            config.headers['Referrer-Policy'] = 'origin-when-cross-origin';
          
          // ...
        
        });


```

```js
// Securedpage.js
   const { data } = await axiosInstance.get("http://localhost:3002/api/" + id, {

      crossDomain: true,
      mode: 'cors',
      timeout: 10000,
      headers: {
        'Accept': '*/*'
      }
    });
```

Back-end application CORS handling:
The most simple solution in the NodeJS/Express which *Enables All CORS Requests* is by using of the following:

```js
import cors from 'cors';

const app = express()
app.use(cors())
```

However, the real world application often runs in a distributed environments which may require more fine grained approach:

```js
// kc-back-end/kc-protected-service/src/app.js

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

// ...

// API Routes, enable CORS handling 
app.options('/api/*', cors(corsOptions));


```


### <a name="_4whgdkq2o1ip"></a>Client configuration 
Configuration to use within the application. It can be obtained from the Installation tab of Keycloak client configuration. Just go to the Installation tab and select Keycloak OIDC JSON as the format. Note that other formats like XML are provided as well.
## <a name="_u29dsx6c52ds"></a>Scopes & Claims
Client scope - is a way to manage the roles that get declared inside an access token. When a client requests that a user be authenticated, the access token they receive back will only contain the role mappings you’ve explicitly specified for the client’s scope. 

Client scopes definitions are shared between multiple clients.

Default Client Scopes - are the same as regular Client scope, but added automatically to each created client.
## <a name="_mjukgbyncgr8"></a>Roles & Groups

Also see the corresponding section in the [RHSSO Configuration Guide](/docs/keycloak/RHSSO_Configuration_Guide.md#_mjukgbyncgr8)

- **Role** - define a type or category of user associated with some permission. Admin, user, manager, and employee are all typical roles that may exist in an organization. Applications often assign access and permissions to specific roles rather than individual users as dealing with users can be too fine grained and hard to manage.
  The roles may be of three types: 
  - *Realm roles* - roles are a global over a Realm.
  - *Client roles* -  dedicated to a client.
  - *Composite roles* - has one or more additional roles associated with it. The inheritance of the role is recursive so any composite of composites also gets inherited.

- **Group** - a collection of users that you can apply roles and attributes to in one place. It manages a common set of attributes and role mappings for a set of users. Users can be members of zero or more groups. Users inherit the attributes and role mappings assigned to each group. A group can have many subgroups, but a group can only have one parent. Subgroups inherit the attributes and role mappings from the parent.
## <a name="_z9ek1o3we79a"></a>**Getting started** 
### <a name="_3h6mov8tmpij"></a>The workflows
The section describes *relations* between application architecture, workflow and Keycloak client types. Also see the corresponding section in the [RHSSO Configuration Guide](/docs/keycloak/RHSSO_Configuration_Guide.md#_3h6mov8tmpij)


|Application type<br>(use)|Authorization flow <br>(Grant Type)|Keycloak client<br>(Access Type)|Notes|
| :-: | :-: | :-: | :-: |
|Mobile or web applications (SPA)|Implicit Grant|Public|userName and password => token|
|Legacy monolith|Resource Owner Password Credentials Grant|Public|userName and password => access token|
|API gateways or M2M interaction|Client Credentials Grant|Confidential|Client ID and secret|
|API gateways or Server side applications|Authorization Code Grant|Bearer-only|Bearer token|

#### <a name="_y8u0q3z3pa6q"></a>Workflow: Web application (Front-end)

Also see the corresponding section in the [RHSSO Configuration Guide](/docs/keycloak/RHSSO_Configuration_Guide.md#_y8u0q3z3pa6q)

**Case:**  application which consists of a **front-end application and the back-end service**. 

The authentication is done via Keycloak. The workflow looks like the following: 

- The user logs into the frontend(browser) and gets a token from Keycloak.
- This token is sent to the backend with every request.
- The back-end uses a token to request the Keycloak for client authentication and  the authorization(when defined) for the requested resource. In case of failure, respond with the “access denied” to the client(HTTP code 403 - forbidden).



![](Aspose.Words.263d3ac1-a93f-4392-b6e9-cc0edbcc4563.001.png)

Application used in workflow:

|**Keycloak client type**|**Keycloak client name**|**Application**|
| :- | :- | :- |
|public|kc-front-end-kc-react|kc-front-end/kc-react|
|bearer-only|kc-back-end-kc-protected-service|kc-back-end/kc-protected-service|

**Important highlights on Keycloak applications:**

**kc-front-end/kc-react**

- Get Keycloak client configuration(JSON):

From the Keycloak “kc-front-end-kc-react” client panel, 

navigate to Clients > kc-front-end-kc-react > Installation, 

then select “Keycloak OIDC JSON”  from the “Format Option” combobox.

Save the content to file keycloak.json in the project to use later. 

The content may look like following:

```json
{
  "realm": "keycloak-demo",

  "auth-server-url": "http://localhost:8080/auth/",

  "ssl-required": "external",

  "resource": "kc-front-end-kc-react",

  "public-client": true,

  "verify-token-audience": true,

  "use-resource-role-mappings": true,

  "confidential-port": 0

}
```


- Initializing Keycloak client:

```js
import Keycloak from 'keycloak-js';

// ...

var kc = undefined;

var kcPromise = undefined;

var kcIinitialized = false;

const useKeycloak = () => {

  if (!kc) {

    kc = new Keycloak('./keycloak.json');

    kc.onTokenExpired = function() {

      console.log('<<< ON TOKEN EXPIRED >>>');

      kc.updateToken(-1);

    }

    kc.onAuthRefreshSuccess = function() {

      console.log('<<< ON TOKEN REFRESH SUCCESS >>>');

      window.accessToken = kc.token;

      window.idToken = kc.idToken;

    }

    kc.onAuthRefreshError = function() {

      console.error('<<< ON TOKEN REFRESH ERROR >>>');

    }

  }

  if(!kcPromise && !kcIinitialized) {

    // init options: login-required | check-sso

    kcIinitialized = true;

    kcPromise = kc.init({ onLoad: 'check-sso', enableLogging: true, refreshToken: true });

  }

  return { kc, kcPromise };

}

```

- Get token:

  The initialized Keycloak instance initiates the login process and in case of success, provides various information such as IdToken, accessToken, UserInfo, etc. that may be used by application logic in order to protect resources or display information. 

  For example:

```js
if (authenticated) {

    window.accessToken = kc.token;

    window.idToken = kc.idToken;

}

else {

    window.accessToken = undefined;

    window.idToken = undefined;

}

....

{keycloak.authenticated && (

    <p>authenticated user: {keycloak.tokenParsed.preferred_username}</p>

)}
```

- Pass token in each request:

  Token is passed within the  “Authorization” HTTP header.

```js
import axios from 'axios';

....

axiosInstance.interceptors.request.use(

  async config => {

    const token = window.accessToken ? window.accessToken : 'dummy\_token';

    config.headers['Authorization'] = 'Bearer ' + token;

    config.headers['Referrer-Policy'] = 'origin-when-cross-origin';

    const idToken = window.idToken ? window.idToken : 'dummy\_id\_token';

    config.headers['X-Forwarded-Access-Token'] = idToken;

    config.headers['Cache-Control'] = 'no-cache';

    console.log('headers set');

    return config;

  },

  error => {

    console.log('interceptor config error: ', error);

    return Promise.reject(error.response? error.response : error);

  });

....
```

**kc-back-end/kc-protected-service**

- Get Keycloak client configuration(JSON):

From the Keycloak “kc-back-end-kc-protected-service” client panel, 

navigate to Clients > kc-back-end-kc-protected-service > Installation, 

then select “Keycloak OIDC JSON”  from the “Format Option” combobox.

Save the content to file keycloak.json in the project to use later. 

The content may look like following:

```json
{

  "realm": "keycloak-demo",

  "bearer-only": true,

  "auth-server-url": "http://localhost:8080/auth/",

  "ssl-required": "external",

  "resource": "kc-back-end-kc-protected-service",

  "verify-token-audience": true,

  "use-resource-role-mappings": true,

  "confidential-port": 0

}
```

- Initializing Keycloak client:

```js
import session from 'express-session';

import Keycloak from 'keycloak-connect';

let keycloak;

function initKeycloak(memoryStore) {

    if (keycloak) {

    console.log("Use existing Keycloak instance.");

    return keycloak;

    }

    else {

    console.log("Initializing Keycloak...");



    keycloak = new Keycloak({

      store: memoryStore,

      secret: 'any_key', 

      resave: false,

      saveUninitialized: true

    }, 'src/config/keycloak.json');



    return keycloak;

    }

}

export default initKeycloak;

```

- Protect resources:

  The initialized Keycloak instance is connected to the Keycloak server in order to get its own token and access rights which used to allow or deny access to the back-end resources. The decision of allow/deny is accepted when validated against a token(and its access rights) from front-end application. This behavior is achieved by keycloak.protect() function.  

  In the following example, anyone with role “user” is allowed to access the /user route of the back-end application. The /admin route - anyone with “admin” role is allowed to access the route, however one with “user” role will get “Access Denied”. 

  For example:

```js
router.get('/user', keycloak.protect('user'), function (req, res) {

  res.send("Hello Admin from BE resource");

});

router.get('/admin', keycloak.protect('admin'), function (req, res) {

  res.send("Hello Admin from BE resource");

});

```




**Case:** application which consists of a **frontend and several backend services**. The backend consists of the back-end service A(protected) service and  the back-end service B(unprotected).The authentication is done via Keycloak. The workflow looks like the following: 

- The user logs into the frontend and gets a token from Keycloak.
- This token is sent to the backend with every request.
- The back-end service A uses a token to request the Keycloak for client authentication and the authorization(when defined) for the requested resource and in case of success, forwards the request without token to the unprotected back-end. In case of failure, respond with the “access denied” to the client(HTTP code 403 - forbidden).
- The back-end serves the client request on and returns a response to the back-end service A.
- The back-end service A transfer response from the **unprotected** back-end service B to the client.


![](Aspose.Words.263d3ac1-a93f-4392-b6e9-cc0edbcc4563.002.png)

#### <a name="_us7ct1e5t42e"></a>Workflow: Machine to machine communication(M2M)

Also see the corresponding section in the [RHSSO Configuration Guide](/docs/keycloak/RHSSO_Configuration_Guide.md#_us7ct1e5t42e)

With machine-to-machine (M2M) applications, such as CLIs, daemons, or services running on the back-end, the system authenticates and authorizes the application rather than a user. For this scenario, typical authentication schemes like username with password or social logins do not make sense. 
For that purpose the Keycloak implements **“service accounts”** which supports the simple idea that a service account is just a machine user. Note that the service accounts don’t show up on user searches, hence, no user information can be accessed. For that reason, in order to communicate with each other, the applications pass along their Client ID and Client Secret to authenticate themselves and get a token.

Remember, that the following Keycloak client types may be used in M2M interaction:

- Confidential (when “Implicit Flow Enabled” is OFF)
- Bearer-only

The decision which type of client to use may be driven by pros and cons of each by following:

||Pros|Cons|
| :- | :- | :- |
|Bearer-only|Setup simplicity|- Less authorization options|
|Confidential|- Service Account ability.<br>- Fine grained authorization|When “Implicit Flow Enabled” is ON and there is no option to change it (externally managed)|


The following example illustrates the use of a “confidential client” with a “service account” on back-end service. In the given scenario, the front-end application has its own “public client” which accesses the back-end service with a “confidential client” using a token. When the access is granted, the back-end is trying to make a call to Keycloak API in order to get some resources.

Here the Keycloak API call represents interaction with another service, as an example of M2M interaction between the back-end service and API server. It requires *an additional token* that must be obtained by the back-end for the “service account” user from Keycloak and used for interaction with the it’s API:

![](Aspose.Words.263d3ac1-a93f-4392-b6e9-cc0edbcc4563.003.png)

**The M2M interaction closeup.**

From technical point of view, the token is passed by “Authorization” header in HTTP request between machines with each other as following: 
['Authorization'] = 'Bearer ' + token;


![](Aspose.Words.263d3ac1-a93f-4392-b6e9-cc0edbcc4563.004.png)

Keycloak clients used in workflow:

|**Keycloak client type**|**Keycloak client name**|**Application**|
| :- | :- | :- |
|public|kc-front-end-kc-react|kc-front-end/kc-react|
|confidential|kc-back-end-kc-protected-m2m-service-with-service-account|kc-back-end/kc-protected-sa-service|

**Important highlights on Keycloak applications:**

**kc-back-end/kc-protected-sa-service**

- Protect resources:

  The initialized Keycloak instance is connected to the Keycloak server in order to get its own token and access rights which used to allow or deny access to the back-end resources. The decision of allow/deny is accepted when validated against a token(and its access rights) from front-end application. This behavior is achieved by keycloak.protect() function.

- Keycloak API call delegation:

  In the following example, the route /api/users may be accessed by any user authenticated by a realm. However, this route initiates a request to the Keycloak API server in order to get a list of all users in the realm. Because of the privileged nature of this API call, special permissions are required. Once defined, the permissions are given to the special user called “service account”, so the access token of the “service account is” is used instead of user access token in order to succeed an API call.

  Function keycloak.grantManager.obtainFromClientCredentials() is aimed to achieve the above API call by retrieving the grant and grant.access\_token.token later as following:


```js
// ....

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

// ....
```



**Case:** application which consists of a **front-end and several back-end services**. The following client types are used for  the given case:

- Front-End: public client
- Back-end “service A”: Bearer-only client 
- Back-end “service B”: Confidential client

The Keycloak authentication workflow looks like the following: 

- The user logs into the front-end and gets a token from Keycloak.
- This token is sent to the back-end “service A” with every request using the HTTP header as follows: ['Authorization'] = 'Bearer ' + token;
- The back-end “service A” uses a token from the front-end to request the Keycloak for client authentication and  the authorization(when defined) for the requested resource and in case of success, forwards the request with a token to the other protected back-end “service B”. In case of failure, respond with the “access denied” to the client(HTTP code 403 - forbidden).
- The back-end “service B” uses a token from “service A” to request the Keycloak for client authentication and  the authorization(when defined) for the requested resource and in case of success, serves the request and return response. In case of failure, respond with the “access denied” to the client(HTTP code 403 - forbidden). 
- The back-end “service A” receives a response from “service B” and returns a response to the front-end application.
- The front-end application receives a response from the **protected** back-end(s).

![](Aspose.Words.263d3ac1-a93f-4392-b6e9-cc0edbcc4563.005.png)

**NOTE:** As a more common case, The back-end “service B” may forward requests to some other service with or without a token depending if the service is protected or not.

**Applications used in workflow:**

|**Keycloak client type**|**Keycloak client name**|**Application**|
| :- | :- | :- |
|public|kc-front-end-kc-react|kc-front-end/kc-react|
|bearer-only|kc-back-end-kc-protected-service|kc-back-end/kc-protected-service|
|confidential|kc-back-end-kc-protected-m2m-service|kc-back-end/kc-protected-m2m-service|

**Important highlights on applications:**

**kc-back-end/kc-protected-service**

Represents the “Back-end service **A**” in the flow.

**kc-back-end/kc-protected-m2m-service**

Represents the “Back-end service **B**” in the flow.

The client is the most complex example in the demo. As the “kc-protected-sa-service” application It implements the same concepts: protection and  Keycloak API call delegation.

While the former is the same, the later is quite different.

- Keycloak API call delegation:
1. The “service account” approach.

   Actually, is the same as in in “kc-protected-sa-service” application, but with different route name:

```js
router.get('/users-works-with-sa', keycloak.protect('user'), function (req, res) {

    keycloak.grantManager.obtainFromClientCredentials()

    .then((grant)=>{
      // ....
    }
```

1. The “role overriding” approach. 
   In the following example, the route /api/users may be accessed by any user authenticated by a realm. However, this route initiates a request to the Keycloak API server in order to get a list of all users in the realm. Because of the privileged nature of this API call, special permissions are required. In contrast with *the “service account” approach*, The special permission is given to the client role and associated with the realm's role “user”. Once defined, the permissions are given to any user in the realm which has a “user” role. 

   In this case, the access token from request is “enriched” with permissions of the  “kc-back-end-kc-protected-m2m-service” client “user” role and its access token is used in order to succeed an API call. The following code is aimed to retrieve the access token from grant: req.kauth.grant.access\_token.

   The following illustrates the implementation details:

```js
router.get('/users', keycloak.protect('user'), function (req, res) {

    const access\_token = (req.kauth && req.kauth.grant)? req.kauth.grant.access\_token: undefined;

    const grant\_access\_token = access\_token.token;

    console.log(`ACCESS\_TOKEN: ${grant\_access\_token}`);

    const keycloakUri = 'http://localhost:8080';

    const keycloakRealm = 'keycloak-demo';

    const url = `${keycloakUri}/auth/admin/realms/${keycloakRealm}/users`;

    getUsers(url, grant\_access\_token)

// ....

```


### <a name="_wuodotk3x2tv"></a>Oauth2 Proxy - The alternative (code-free) workflow. 
See also the corresponding section in the [RHSSO Configuration Guide](/docs/keycloak/RHSSO_Configuration_Guide.md#_wuodotk3x2tv)
#### <a name="_cuedlvgogitg"></a>Workflow: Web application with Front-end and/or Backend

**Case:**  application which consists of a following:

- The front-end application and the back-end service. 
- The front-end application only
- The back-end service only.

As in cases above, the authentication is done via Keycloak, however with the help of a small  reverse proxy that provides authentication using Keycloak as a provider. The workflow looks like the following: 

Browser based flow:
1\. The user is browsing to the URL of Oauth2 Proxy server with credentials in order to initialize the login process to the Keycloak server.
2\. When credentials are valid, Oauth2 proxy makes a redirect to its upstream service(back-end or  front-end).
3\. This token is saved as cookie(default setting) while Oauth2 Proxy server uses it within every request to the upstream service.

![](Aspose.Words.263d3ac1-a93f-4392-b6e9-cc0edbcc4563.006.png)

**NOTE:** The purpose of NGINX in the flow is to provide support for SSL, CORS handling etc.

There is no coding required, only definitions in Keycloak and Oauth2 Proxy server.
These definitions goes as following:

**Keycloak settings:**

|**parameter**|**value**|**notes**|
| :- | :- | :- |
|Client type|confidential|Bearer-only may be used for M2M flow|
|Redirect URL|<oauth2-proxy-host>:4180/oauth2/callback||
|Web Origins|\*|Cors handling|


**Oauth2 Proxy settings:**

|**parameter**|**value**|**notes**|
| :- | :- | :- |
|--provider|keycloak-oidc||
|--set-xauthrequest|true||
|--auth-logging|true|optional|
|--pass-authorization-header|true||
|--request-logging|true|optional|
|--client-id|${client\_id}||
|--client-secret|${client\_secret}||
|--cookie-secret|${client\_secret}|Not used, but mandatory ))|
|--redirect-url|${redirect\_url}||
|--upstream|${upstream\_url}|Pass to the service|
|--oidc-issuer-url|http://<keycloak\_host>:<keycloak\_port>/auth/realms/<realm\_name>|Provider URL(Keycloak)|
|--email-domain|\*|Use real domain|
|--show-debug-on-error|true|optional|
|--pass-user-headers|true||
|--skip-jwt-bearer-tokens|false||
|--skip-provider-button|true|Skip Oauth2 login page|
|--skip-auth-preflight|true|CORS Handling|
|--pass-access-token|true||
|--code-challenge-method|S256||
|--whitelist-domain|<front-end-host> <back-end-host> <oauth2-proxy-host>|CORS handling|
|--session-store-type|cookie||
|--cookie-expire|5m|Value from Keycloak|
|--cookie-refresh|3m|Value from Keycloak|
|--scope|openid roles profile email||
|--oidc-extra-audience|aud-mapper-oauth2proxy-back-end-service||
|--insecure-oidc-allow-unverified-email|TRUE|Value from Keycloak|
|--cookie-samesite|lax|CORS handling|
|--reverse-proxy|false|When not using NGINX|

