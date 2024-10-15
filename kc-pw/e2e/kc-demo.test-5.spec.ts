import { test, expect, chromium, request, APIRequestContext, Cookie, APIResponse } from '@playwright/test';
//import fs, {} from 'node:fs';

function parseCookiesToMap(cookies: string[]): Map<string, string> {
    const cookieMap = new Map<string, string>();

    cookies.forEach((cookie) => {
        // Split by the first '=' to separate key and value
        const [keyValuePair, ...attributes] = cookie.split(';');
        const [key, value] = keyValuePair.split('=');
        
        // Trim to remove any extra spaces and add to the Map
        if (key && value) {
        cookieMap.set(key.trim(), value.trim());
        }
    });

    return cookieMap;
}

// Function to parse cookie string into an array of Cookie objects
const parseCookies = (cookieStr: string): Cookie[] => {
    return cookieStr.split('\n').map(cookie => {
      const parts = cookie.split('; ');
      const [name, value] = parts[0].split('=');
  
      // Initialize cookie object conforming to the Playwright Cookie interface
      const cookieObj: Cookie = {
        name,
        value,
        domain: "localhost", // Needs to be set based on your domain
        path: "/", // Default path, can be customized
        expires: -1, // Default expiration if not provided
        httpOnly: false,
        secure: false,
        sameSite: "Lax" // Default sameSite policy
      };
  
      // Parse other attributes (HttpOnly, Secure, Expires, Path, SameSite)
      parts.slice(1).forEach(attr => {
        if (attr.startsWith('Expires=')) {
          cookieObj.expires = Math.floor(new Date(attr.split('=')[1]).getTime() / 1000); // Convert to Unix time
        } else if (attr === 'HttpOnly') {
          cookieObj.httpOnly = true;
        } else if (attr === 'Secure') {
          cookieObj.secure = true;
        } else if (attr.startsWith('Path=')) {
          cookieObj.path = attr.split('=')[1];
        } else if (attr.startsWith('SameSite=')) {
          cookieObj.sameSite = attr.split('=')[1] as 'Strict' | 'Lax' | 'None';
        }
      });
  
      return cookieObj;
    });
  };
  


test('Impersonation scenario in Playwright', async () => {
    const KEYCLOAK_URL = 'http://localhost:8080';
    const KEYCLOAK_REALM = 'keycloak-demo';
    const client_id = 'kc-back-end-kc-protected-m2m-service-with-service-account';
    const client_secret = 'p9L8Vwe24z9KBezXtHXa9qqS8fl1cis9';
    const audience = 'kc-front-end-kc-react';
    const USER_NAME = 'user1';
    const AUTH_REQ_CLIENT_ID = 'kc-front-end-kc-react';
    const AUTH_REQ_REDIRECT_URI = 'http://localhost:5000';
    let cookies:Array<Cookie> = [];
    let accessToken;

    // 1. Get token of impersonator
    const apiContext = await request.newContext();
    const tokenResponse = await apiContext.post(`${KEYCLOAK_URL}/auth/realms/${KEYCLOAK_REALM}/protocol/openid-connect/token`, {
      form: {
        client_id,
        client_secret,
        grant_type: 'client_credentials',
        audience,
      },
    });

    const impersonatorToken = (await tokenResponse.json()).access_token;
  
    // 2. Find User ID based on the username
    const userIdResponse = await apiContext.get(`${KEYCLOAK_URL}/auth/admin/realms/${KEYCLOAK_REALM}/users?username=${USER_NAME}`, {
      headers: {
        Authorization: `Bearer ${impersonatorToken}`,
        Accept: 'application/json',
      },
    });
    
    const userId = (await userIdResponse.json())[0].id;
  
    // 3. Impersonate target user and collect cookies through browser context
    const browser = await chromium.launch();
    const context = await browser.newContext();
  
    // Impersonate the user by navigating to the impersonation endpoint
    const page = await context.newPage();
    await page.setExtraHTTPHeaders(       
        {
            Authorization: `Bearer ${impersonatorToken}`,
            Accept: 'application/json, text/plain, */*',
        },
    )
    
    ///////////////// COLLECT COOKIES /////////////////////
    const impersonateResponse: APIResponse = await apiContext.post(`${KEYCLOAK_URL}/auth/admin/realms/${KEYCLOAK_REALM}/users/${userId}/impersonation`, {
        headers: {
            Authorization: `Bearer ${impersonatorToken}`,
            Accept: 'application/json, text/plain, */*' 
          },
      });

      const responseHeaders = impersonateResponse.headers();

      // The response will have 'Set-Cookie' header.
      const setCookie = responseHeaders['set-cookie'];   
    //   const responseCookies: Map<string, string>  =  parseCookiesToMap(setCookie.split('\n'));
    //   // The response will have 3 cookies in 'Set-Cookie' header.
    //   expect(responseCookies.size).toBe(4);
    

    // Parse the cookies from the raw string
    const responseCookies: Cookie[] = parseCookies(setCookie);

    // Define the storageState object manually with cookies and empty localStorage
    const storageState = {
    cookies: responseCookies,
    origins: ['http://localhost:8080','http://localhost:5000'] // Add localStorage or sessionStorage if needed
    };
    ///////////////////////////////////////////////////////
    
    // const imp_resp = await page.goto(`${KEYCLOAK_URL}/auth/admin/realms/${KEYCLOAK_REALM}/users/${userId}/impersonation`, {waitUntil:'domcontentloaded'});

    // // 4. Collect cookies after impersonation
    // cookies = await context.cookies(['http://localhost:8080','http://localhost:5000']);
    // for (const cookie of cookies) {
    //     console.log(JSON.stringify(cookie));
    // }
    // // 5. Define a storage state object manually with cookies and empty localStorage
    // const storageState = {
    //   cookies: responseCookies ... cookie => ({
    //     name: cookie.name,
    //     value: cookie.value,
    //     domain: cookie.domain,
    //     path: cookie.path,
    //     expires: cookie.expires || -1, // Handle cookie expiration
    //     httpOnly: cookie.httpOnly,
    //     secure: cookie.secure,
    //     sameSite: cookie.sameSite as "Strict" | "Lax" | "None"
    //   })),
    //   origins: [] // You can add any localStorage key-value pairs here if needed
    // };
  
    // 6. Launch browser with the storageState containing cookies
    const newContext = await browser.newContext();
    newContext.addCookies(storageState.cookies);
    // 7. Perform actions in the application as the impersonated user
    const newPage = await newContext.newPage();

//////////////////
    // await newPage.route(
    //     //`${KEYCLOAK_URL}/auth/realms/${KEYCLOAK_REALM}/protocol/openid-connect/auth`,
    //     'http://localhost:5000/*',
    //     async (route) => {
    //         console.log("*** INTERCEPTOR ***");
    //         // Make the original request
    //         const response = await route.fetch();
    //         // route.fetch() was added in v1.29, for lower versions do:
    //         // const response = await page.request.fetch(route.request());

    //         // Get the response
    //         const result = await response.json();

    //         // Modify the response
    //         const modifiedResult = result.map((post) => {
    //             return { ...post, title: `${post.title} (Modified)` };
    //         });

    //         route.fulfill({ json: modifiedResult });
    //         // route.fullfill({ json }) was added in v1.29, for lower versions do:
    //         // route.fulfill({
    //         //     response,
    //         //     body: JSON.stringify(
    //         //         result.map((post) => ({ ...post, title: `${post.title} (Modified)` }))
    //         //     ),
    //         // });
    //     }
    // );

    newPage.on("response", async function(response) {
		const { hostname, pathname } = new URL(response.url());
        console.log(`hostname=${hostname}, pathname=${pathname}`);

        if (pathname === `/auth/realms/${KEYCLOAK_REALM}/protocol/openid-connect/auth`) {
            const headers = await response.allHeaders().then(h => {return h});
            const data = headers;
            console.log('AUTH response %O', data);
        }
        else if (pathname === `/auth/realms/${KEYCLOAK_REALM}/protocol/openid-connect/token`) {
            const headers = await response.allHeaders().then(h => {return h});
            const data = headers;
            const body = await response.json().then(b => {return b});
            accessToken = body.access_token;
            accessToken = body.id_token;
            //console.log('TOKEN response %O, %O', data, body);
            console.log('TOKEN response %O', accessToken);
        }
        else if (pathname == '/auth/realms/keycloak-demo/protocol/openid-connect/login-status-iframe.html'){

        }
    });
/////////////////

    await newPage.goto(AUTH_REQ_REDIRECT_URI);
    await newPage.reload();
    // Your test assertions and logic here
    await newPage.waitForSelector(`text="authenticated user: ${USER_NAME}"`); // Adjust based on your app logic
  
// logout
    // Get the ID_TOKEN
    //const apiContext = await request.newContext();
    
    const idTokenResponse = await newPage.request.post(`${KEYCLOAK_URL}/auth/realms/${KEYCLOAK_REALM}/protocol/openid-connect/token`, {
    headers: {
        //'Content-Type': 'application/json',
        //'Content-Type': 'application/xml',
        //'Content-Type': 'application/x-www-form-urlencoded',
        'Accept': '*/*',
    },
    form: {
        client_id,
        client_secret,
        grant_type: 'client_credentials',
        scope: 'openid',
        response_type: 'access_token',
    },
    });
    const idToken = (await idTokenResponse.json()).access_token;
    expect(idToken).not.toBe(undefined);
    console.log(`idToken=${idToken}`);


   // http://localhost:8080/auth/realms/keycloak-demo/protocol/openid-connect/logout?client_id=account-console&post_logout_redirect_uri=http%3A%2F%2Flocalhost%3A8080%2Fauth%2Frealms%2Fkeycloak-demo%2Faccount%2F%23%2F&id_token_hint=
   // http://localhost:8080/auth/realms/keycloak-demo/protocol/openid-connect/logout?client_id=kc-front-end-kc-react&post_logout_redirect_uri=http%3A%2F%2Flocalhost%3A5000%2F
   const logoutResponse = await newPage.request.post('http://localhost:8080/auth/realms/keycloak-demo/protocol/openid-connect/logout',{
    headers: {
        //'Content-Type': 'application/json',
        //'Content-Type': 'application/xml',
        'Content-Type': 'application/x-www-form-urlencoded',
        'Accept': '*/*',
        Authorization: `Bearer ${accessToken}`,
    },
    data: {
            client_id: 'kc-front-end-kc-react',
            post_logout_redirect_uri: 'http://localhost:5000/',//'http://localhost:8080/auth/realms/keycloak-demo/account/#/',
            id_token_hint: accessToken
        }
    });
    const lr = (await logoutResponse.statusText());
    console.log(`status=${lr}`);
    await newPage.waitForTimeout(5000);
    ////////////////////////
    // const logoutResponseHeaders = logoutResponse.headers();
    // // The response will have 'Set-Cookie' header.
    // const logoutSetCookie = logoutResponseHeaders['set-cookie'];   
    // // Parse the cookies from the raw string
    // const logoutResponseCookies: Cookie[] = parseCookies(logoutSetCookie);
    // // Define the storageState object manually with cookies and empty localStorage
    // const logoutStorageState = {
    //     cookies: logoutResponseCookies,
    //     origins: ['http://localhost:8080','http://localhost:5000'] // Add localStorage or sessionStorage if needed
    //     };
    // //newContext.clearCookies();    
    // newContext.addCookies(logoutStorageState.cookies);
    
    // const _cookies = await newContext.cookies();

    // //console.log(_cookies); // prints array of ALL cookie objects
    
    // const sessionCookie = _cookies.find((c) => c.name === "KEYCLOAK_SESSION");
    // const sessionCookieParts = sessionCookie?.value.split("/");
    // const sessionId = sessionCookie?.value.split("/").pop();
    // const logoutUserId = sessionCookie?.value.split("/").pop();
    
    // const tokenCookie  = _cookies.find((c) => c.name === "KEYCLOAK_IDENTITY");
    // // Delete Session http://localhost:8080/auth/admin/realms/keycloak-demo/sessions/5820b032-1fec-4553-8f18-fd92f0b6a95d
    // const logoutResponse2 = await newContext.request.delete(`${KEYCLOAK_URL}/auth/admin/realms/${KEYCLOAK_REALM}/sssions/${sessionId}`,
    // {
    //     headers: {
    //         Authorization: `Bearer ${tokenCookie?.value}`,
    //         Accept: 'application/json',
    //       },
    // });
///////////////////////////////
    // const lr2 = (await logoutResponse2.statusText());
    // console.log(`status=${lr2}`);

    // const logoutResponse3 = await newContext.request.get('http://localhost:8080/auth/realms/keycloak-demo/protocol/openid-connect/logout',{
    //     data: {
    //         client_id: 'kc-front-end-kc-react',
    //         post_logout_redirect_uri: 'http://localhost:5000/',//'http://localhost:8080/auth/realms/keycloak-demo/account/#/',
    //         id_token_hint: tokenCookie?.value
    //     }
    // });
    // const lr3 = (await logoutResponse3.statusText());
    // console.log(`status=${lr3}`);

    // await newPage.reload();


// Clear browser cookies
// await newContext.clearCookies();
// await newPage.waitForTimeout(5000);

////////////////////////////
// Execute page scenario
////////////////////////////
await newPage.getByRole('button', { name: 'Get user resource' }).click();
await newPage.waitForTimeout(2000);
await newPage.getByRole('button', { name: 'Get admin resource' }).click();
await newPage.waitForTimeout(2000);
await newPage.getByRole('button', { name: 'Get m2m resource as \'user\'' }).click();
await newPage.waitForTimeout(2000);
await newPage.getByRole('button', { name: 'Get m2m resource as \'admin\'' }).click();
await newPage.waitForTimeout(2000);
await newPage.getByRole('button', { name: 'Get m2m resource using \'' }).click();
await newPage.waitForTimeout(2000);
await newPage.getByRole('button', { name: 'clear' }).first().click();
await newPage.getByRole('button', { name: 'Get resource using a \'service' }).click();
await newPage.getByRole('button', { name: 'clear' }).nth(1).click();



// // Navigate to Keycloak logout URL to invalidate server session
await newPage.goto(`http://localhost:8080/auth/realms/keycloak-demo/protocol/openid-connect/logout??client_id=kc-front-end-kc-react&post_logout_redirect_uri=http%3A%2F%2Flocalhost%3A5000%2F&id_token_hint=${accessToken}`);

// const res = await newPage.reload();
// if (res && await res.status() === 302) {
//     const redirectUrl = res.headers()['location'];
//     console.log(`follow the redirect=${redirectUrl}`);
//     await page.goto(redirectUrl); // Manually follow the redirect
//   }
// // Optionally clear localStorage/sessionStorage if needed
// await newPage.evaluate(() => {
//   localStorage.clear();
//   sessionStorage.clear();
// });

    await newPage.waitForTimeout(10000);
    await browser.close();
  });
