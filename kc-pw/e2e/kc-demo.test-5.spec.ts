import { test, expect, chromium, request, APIRequestContext, Cookie } from '@playwright/test';
//import fs, {} from 'node:fs';

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
    
    const imp_resp = await page.goto(`${KEYCLOAK_URL}/auth/admin/realms/${KEYCLOAK_REALM}/users/${userId}/impersonation`, {waitUntil:'domcontentloaded'});

    // 4. Collect cookies after impersonation
    cookies = await context.cookies(['http://localhost:8080','http://localhost:5000']);
    for (const cookie of cookies) {
        console.log(JSON.stringify(cookie));
    }
    // 5. Define a storage state object manually with cookies and empty localStorage
    const storageState = {
      cookies: cookies.map(cookie => ({
        name: cookie.name,
        value: cookie.value,
        domain: cookie.domain,
        path: cookie.path,
        expires: cookie.expires || -1, // Handle cookie expiration
        httpOnly: cookie.httpOnly,
        secure: cookie.secure,
        sameSite: cookie.sameSite as "Strict" | "Lax" | "None"
      })),
      origins: [] // You can add any localStorage key-value pairs here if needed
    };
  
    // 6. Launch browser with the storageState containing cookies
    const newContext = await browser.newContext({ storageState });
  
    // 7. Perform actions in the application as the impersonated user
    const newPage = await newContext.newPage();
    await newPage.goto(AUTH_REQ_REDIRECT_URI);
  
    // Your test assertions and logic here
    await newPage.waitForSelector('text="Welcome, user1"'); // Adjust based on your app logic
  
    await browser.close();
  });
