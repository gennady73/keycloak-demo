// filename: tests/kc-demo.spec.ts
import { test, expect, request, APIRequestContext, JSHandle } from '@playwright/test';
import Keycloak, { KeycloakInitOptions, KeycloakAdapter } from 'keycloak-js';
//import fs, {} from 'node:fs';

// Configuration
const KEYCLOAK_URL = 'http://localhost:8080';
const KEYCLOAK_REALM = 'keycloak-demo';
const CLIENT_ID = 'kc-back-end-kc-protected-m2m-service-with-service-account';
const CLIENT_SECRET = 'Q9CXMvfKFNV5tOgFQfMxKKnb5tZzcQoF';
const GROUP_ID = 'a12bab52-ac28-47cf-97a1-bf020e4d479a';

declare global {
  interface Window {
    accessToken?: string;
    idToken?: string;
    kc?: Keycloak;        // To hold the Keycloak instance
    kcPromise?: Promise<boolean>;
    kcInitialized?: boolean;
  }
}

let apiContext: APIRequestContext; // Shared context
let accessToken: string;
let idToken: string;
let keycloak:Keycloak;

    const addScript = async src => new Promise((resolve, reject) => {
      const el = document.createElement('script');
      el.src = src;
      el.addEventListener('load', resolve);
      el.addEventListener('error', reject);
      document.body.append(el);
  });

test.describe('Keycloak Authentication and API Requests', () => {

  test.beforeAll(async () => {
    // Step 1: Initialize API request context
    apiContext = await request.newContext();

    // Step 2: Obtain the access token
    const tokenResponse = await apiContext.post(`${KEYCLOAK_URL}/auth/realms/${KEYCLOAK_REALM}/protocol/openid-connect/token`, {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      data: new URLSearchParams({
        client_id: CLIENT_ID,
        client_secret: CLIENT_SECRET,
        grant_type: 'client_credentials',
        audience: 'kc-front-end-kc-react',
      }).toString(),
    });

    if (!tokenResponse.ok()) {
      throw new Error(`Failed to obtain access token: ${tokenResponse.status()} - ${tokenResponse.statusText()}`);
    }

    const tokenData = await tokenResponse.json();
    accessToken = tokenData.access_token;
    idToken = 'some_id_token';//tokenData.id_token;

  });

// Playwright test to initialize Keycloak in the React app
test('Initialize Keycloak in React App with custom adapter', async ({ page }) => {
  // Navigate to the React app
  await page.goto('http://localhost:5000');

  // await page.evaluate(([kc,accessToken, idToken]) => {
  //   const el = document.createElement('script');
  //   el.src = './node_modules/keycloak-js/dist/keycloak.js';
  //   document.body.append(el);

  // }, [keycloak, accessToken, idToken]);
  
  // await page.reload();
// Read keycloak.js as a string from the file system

//const keycloakScript = fs.readFileSync('/home/gunger/Documents/RHSSO/demo/project/keycloak-demo/kc-pw/node_modules/keycloak-js/dist/keycloak.js', 'utf8');

  // Add the script content directly to the page
  //await page.addScriptTag({ content: keycloakScript });

  const doc:JSHandle = await page.evaluateHandle('document');
  
  const useKeycloak = await doc.evaluateHandle(function useKeycloak(): Promise<boolean> {

  
    const keycloak:Keycloak = new Keycloak('./keycloak.json');
//////////////////////////

   // Define custom Keycloak adapter
   class CustomKeycloakAdapter implements KeycloakAdapter {
    private accessToken: string | undefined;
    private idToken: string | undefined;

    constructor(accessToken?: string, idToken?: string) {
      this.accessToken = accessToken;
      this.idToken = idToken;
    }

    login(): Promise<void> {
      console.log('Custom login logic executed.');
      if (this.accessToken) {
        window.accessToken = this.accessToken;
        window.idToken = this.idToken;
        console.log(`Access Token Set: ${this.accessToken}`);
        console.log(`ID Token Set: ${this.idToken}`);
      }
      return Promise.resolve();
    }

    logout(): Promise<void> {
      console.log('Custom logout logic executed.');
      window.accessToken = undefined;
      window.idToken = undefined;
      return Promise.resolve();
    }

    register(): Promise<void> {
      console.log('Custom register logic executed.');
      return Promise.resolve();
    }

    accountManagement(): Promise<void> {
      console.log('Custom account management logic executed.');
      return Promise.resolve();
    }

    redirectUri(options?: { redirectUri?: string }): string {
      console.log('Custom redirect URI logic executed.');
      return options?.redirectUri || window.location.href;
    }
  }

  // Initialize Keycloak with custom adapter
  // keycloak = new Keycloak({
  //   url: 'http://localhost:8080/auth',
  //   realm: 'keycloak-demo',
  //   clientId: 'kc-back-end-kc-protected-m2m-service-with-service-account',
  // });
  //keycloak = await doc.useKeycloak();//new Keycloak('./keycloak.json');
  // Create adapter with the injected token
  const adapter:KeycloakAdapter = new CustomKeycloakAdapter(accessToken);

  const keycloakInitOptions: KeycloakInitOptions = {
    adapter: adapter,
    onLoad: 'check-sso',
    checkLoginIframe: false,
  };

  // Use the custom adapter to initialize Keycloak
  // keycloak.init(keycloakInitOptions).then((authenticated) => {
  //   if (authenticated) {
  //     console.log('Keycloak initialized with custom adapter in the app context.');
  //   } else {
  //     console.log('Keycloak not authenticated.');
  //   }
  // }).catch((error) => {
  //   console.error('Error during Keycloak initialization:', error);
  // });


/////////////////////////
    return Promise.resolve(keycloak.init(keycloakInitOptions));
  });

 // window.kcPromise = await useKeycloak;
  // Inject Keycloak token and custom adapter into the DOM
  await page.evaluate(async ([accessToken, useKeycloak]) => {
    // const el = document.createElement('script');
    // el.src = './node_modules/keycloak-js/dist/keycloak.mjs';
    // document.body.append(el);


    // // Define custom Keycloak adapter
    // class CustomKeycloakAdapter implements KeycloakAdapter {
    //   private accessToken: string | undefined;
    //   private idToken: string | undefined;

    //   constructor(accessToken?: string, idToken?: string) {
    //     this.accessToken = accessToken;
    //     this.idToken = idToken;
    //   }

    //   login(): Promise<void> {
    //     console.log('Custom login logic executed.');
    //     if (this.accessToken) {
    //       window.accessToken = this.accessToken;
    //       window.idToken = this.idToken;
    //       console.log(`Access Token Set: ${this.accessToken}`);
    //       console.log(`ID Token Set: ${this.idToken}`);
    //     }
    //     return Promise.resolve();
    //   }

    //   logout(): Promise<void> {
    //     console.log('Custom logout logic executed.');
    //     window.accessToken = undefined;
    //     window.idToken = undefined;
    //     return Promise.resolve();
    //   }

    //   register(): Promise<void> {
    //     console.log('Custom register logic executed.');
    //     return Promise.resolve();
    //   }

    //   accountManagement(): Promise<void> {
    //     console.log('Custom account management logic executed.');
    //     return Promise.resolve();
    //   }

    //   redirectUri(options?: { redirectUri?: string }): string {
    //     console.log('Custom redirect URI logic executed.');
    //     return options?.redirectUri || window.location.href;
    //   }
    // }

    // // Initialize Keycloak with custom adapter
    // // keycloak = new Keycloak({
    // //   url: 'http://localhost:8080/auth',
    // //   realm: 'keycloak-demo',
    // //   clientId: 'kc-back-end-kc-protected-m2m-service-with-service-account',
    // // });
    //keycloak = await useKeycloak();//new Keycloak('./keycloak.json');
    // // Create adapter with the injected token
    // const adapter:KeycloakAdapter = new CustomKeycloakAdapter(accessToken);

    // const keycloakInitOptions: KeycloakInitOptions = {
    //   adapter: adapter,
    //   onLoad: 'check-sso',
    //   checkLoginIframe: false,
    // };

    // // Use the custom adapter to initialize Keycloak
    // keycloak.init(keycloakInitOptions).then((authenticated) => {
    //   if (authenticated) {
    //     console.log('Keycloak initialized with custom adapter in the app context.');
    //   } else {
    //     console.log('Keycloak not authenticated.');
    //   }
    // }).catch((error) => {
    //   console.error('Error during Keycloak initialization:', error);
    // });

    // Mock the useKeycloak function to use this initialized instance
    window.kc = keycloak;
    window.kcPromise = Promise.resolve(true);
    window.kcInitialized = true;

  }, [accessToken,useKeycloak]);

  // Interact with the app, using the injected Keycloak instance
  // Here you can perform additional actions like clicking buttons, making assertions, etc.
  await page.getByRole('button', { name: 'Get user resource' }).click();
  await page.waitForTimeout(2000); // Wait for action to complete
});


  // test('Fetch Group Information and Make API Calls', async ({ page, context }) => {
  //   const apiHeaders = {
  //     'Accept': 'application/json',
  //     'Content-Type': 'application/x-www-form-urlencoded',
  //     'Authorization': `Bearer ${accessToken}`,
  //   };

  //   // Step 3: Fetch Groups list
  //   const groupsResponse = await apiContext.get(`${KEYCLOAK_URL}/auth/admin/realms/${KEYCLOAK_REALM}/groups`, {
  //     headers: apiHeaders,
  //   });
  //   expect(groupsResponse.ok()).toBeTruthy();
  //   console.log(await groupsResponse.json());

  //   // Step 4: Fetch Group overview
  //   const groupOverviewResponse = await apiContext.get(`${KEYCLOAK_URL}/auth/admin/realms/${KEYCLOAK_REALM}/groups/${GROUP_ID}`, {
  //     headers: apiHeaders,
  //   });
  //   expect(groupOverviewResponse.ok()).toBeTruthy();
  //   console.log(await groupOverviewResponse.json());

  //   // Step 5: Fetch Group permissions
  //   const groupPermissionsResponse = await apiContext.get(`${KEYCLOAK_URL}/auth/admin/realms/${KEYCLOAK_REALM}/groups/${GROUP_ID}/management/permissions`, {
  //     headers: apiHeaders,
  //   });
  //   expect(groupPermissionsResponse.ok()).toBeTruthy();
  //   console.log(await groupPermissionsResponse.json());

  //   // Step 6: Fetch Group members
  //   const groupMembersResponse = await apiContext.get(`${KEYCLOAK_URL}/auth/admin/realms/${KEYCLOAK_REALM}/groups/${GROUP_ID}/members`, {
  //     headers: apiHeaders,
  //   });
  //   expect(groupMembersResponse.ok()).toBeTruthy();
  //   console.log(await groupMembersResponse.json());

  //   // Step 7: Fetch Role mappings
  //   const roleMappingsResponse = await apiContext.get(`${KEYCLOAK_URL}/auth/admin/realms/${KEYCLOAK_REALM}/groups/${GROUP_ID}/role-mappings`, {
  //     headers: apiHeaders,
  //   });
  //   expect(roleMappingsResponse.ok()).toBeTruthy();
  //   console.log(await roleMappingsResponse.json());

  //   // Step 8: Get protected resource
  //   const protectedResourceResponse = await apiContext.get('http://localhost:3002/api/user', {
  //     headers: apiHeaders,
  //   });
  //   expect(protectedResourceResponse.ok()).toBeTruthy();
  //   console.log(await protectedResourceResponse.json());

  //   // Step 9: Execute final request in browser context
  //   await context.addCookies([{
  //     name: 'KEYCLOAK_IDENTITY',
  //     value: accessToken,
  //     domain: 'localhost',
  //     path: '/',
  //     httpOnly: true,
  //     secure: false,
  //   }]);

  //   // Go to the relevant page to trigger the request in the browser
  //   await page.goto('http://localhost:5000/');
    
  //   // Make a fetch call within the browser context with the necessary headers
  //   await page.evaluate(async (token) => {
  //     const response = await fetch('http://localhost:3002/api/user', {
  //       method: 'GET',
  //       headers: {
  //         'Accept': '*/*',
  //         'Content-Type': 'application/x-www-form-urlencoded',
  //         'Authorization': `Bearer ${token}`,
  //         'x-forwarded-access-token': token,
  //         'x-requested-with': 'XMLHttpRequest',
  //         'sec-fetch-mode': 'cors',
  //         'cache-control': 'no-cache',
  //         'connection': 'keep-alive',
  //         'origin': 'http://localhost:5000',
  //         'referer': 'http://localhost:5000/',
  //       },
  //     });
  //     const data = await response.json();
  //     console.log(data);
  //   }, accessToken);
  // });

  test.afterAll(async () => {
    await apiContext.dispose(); // Dispose of the API context if necessary
  });
});
