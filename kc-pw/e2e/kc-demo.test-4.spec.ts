// filename: tests/kc-demo.spec.ts
import { test, expect, request, BrowserContext, APIRequestContext, Page, Browser, chromium } from '@playwright/test';
import Keycloak, { KeycloakInitOptions, KeycloakAdapter } from 'keycloak-js';
//import fs, {} from 'node:fs';

// import Secured, { AuthContext } from "../../kc-front-end/kc-react/src/components/Secured.js";
// import { test, expect } from '@playwright/experimental-ct-react';
// import { beforeMount, afterMount } from '@playwright/experimental-ct-react/hooks';
// import React, { useContext } from "react";

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

let authContext: BrowserContext;
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


test.describe('Keycloak Authentication and API Requests MOCK', () => {

  test.beforeAll(async () => {
    const browser = await chromium.launch();
    // Step 1: Initialize API request context
    //apiContext = await request.newContext();
    // Create a new browser context and API request context
    authContext = await browser.newContext();
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
    idToken = 'mocked_identity_token';//tokenData.id_token;

    // Mock the request to the Keycloak login status iframe
    // http://localhost:8080/auth/realms/keycloak-demo/protocol/openid-connect/login-status-iframe.html/init?client_id=kc-front-end-kc-react&origin=http%3A%2F%2Flocalhost%3A5000

    await authContext.route('**/auth/realms/keycloak-demo/protocol/openid-connect/login-status-iframe.html/init', (route) => {
      // Mock response to include 'KEYCLOAK_IDENTITY' cookie instead of 'KC_RESTART'
      route.fulfill({
        status: 200,
        headers: {
          'Set-Cookie': `KEYCLOAK_IDENTITY=${idToken}; Path=/; HttpOnly; SameSite=Lax`,
          'Content-Type': 'text/html',
        },
        body: '<html><body>Mocked response for Keycloak login status</body></html>',
      });
    });
    
    await authContext.addCookies([{
      name: 'KEYCLOAK_IDENTITY',
      value: accessToken,
      //domain: 'localhost',
      //path: '/auth/realms/keycloak-demo/',
      httpOnly: true,
      secure: false,
      url: 'http://localhost:5000'
    }]);

    const authSessionID='8fe8f69b-ec60-42f8-a6a9-6626ed05cb41.jdg1';
    await authContext.addCookies([{
      name: 'AUTH_SESSION_ID',
      value: authSessionID,
      //domain: 'localhost',
      //path: '/auth/realms/keycloak-demo/',
      httpOnly: true,
      secure: false,
      url: 'http://localhost:5000'
    }]);

    await authContext.addCookies([{
      name: 'KEYCLOAK_IDENTITY',
      value: accessToken,
      domain: 'localhost',
      path: '/auth/realms/keycloak-demo/',
      httpOnly: true,
      secure: false,
    }]);

    //const authSessionID='8fe8f69b-ec60-42f8-a6a9-6626ed05cb41.jdg1';
    await authContext.addCookies([{
      name: 'AUTH_SESSION_ID',
      value: authSessionID,
      domain: 'localhost',
      path: '/auth/realms/keycloak-demo/',
      httpOnly: true,
      secure: false,
    }]);

    // Save the authentication state after mocking the response
    await authContext.storageState({ path: 'auth-mocked.json' });

  });


  test('Perform actions with mocked Keycloak authentication MOCK', async ({ browser }) => {
    // Create a new context with saved state
    const context = await browser.newContext({ storageState: 'auth-mocked.json' });
    const page = await context.newPage();
    page.context.apply(context);


////////////
  // Define the mock script content
  const mockScript = `
    // Define a mock Keycloak object
    const mockKeycloak = {
      authenticated: true,
      token: 'mocked-token',
      login: () => console.log('Mock login called'),
      logout: () => console.log('Mock logout called'),
      updateToken: () => Promise.resolve('mocked-updated-token'),
    };

    // Define a mock context value to override
    const mockContextValue = {
      keycloak: mockKeycloak,
      setKeycloak: () => console.log('Mock setKeycloak called'),
    };

    // Mock the AuthContext.Provider to always return the mock context value
    window.React = window.React || {};
    window.React.createElement = (type, props, ...children) => {
      if (type && type.name === 'AuthContext.Provider') {
        // Override context value with the mock
        return window.React.createElement(type, { ...props, value: mockContextValue }, ...children);
      }
      return window.React.createElement(type, props, ...children);
    };
  `;

  // Inject the mock script into the page
  await page.addInitScript({ content: mockScript });












    await page.goto('http://localhost:5000/');
    await page.bringToFront();
    //await page.waitForTimeout(20000);
    await expect(await page.getByRole('button', { name: 'Get user resource' })).toBeDefined();
    await expect(await page.getByRole('button', { name: 'logout' })).toBeDefined();
    await expect(await page.getByRole('button', { name: 'login' })).toBeDefined();
    await page.bringToFront();
    await page.waitForTimeout(5000);
    // Load your application
 // await page.goto('http://localhost:5000/');

  // Continue with your tests, the mock should now be in place

  await page.getByRole('button', { name: 'login' }).click();
  await page.waitForTimeout(15000);
  // Test that the mocked context value is used
  // await page.evaluate(() => {
  //   // Perform assertions or other checks using the mock
  //   console.log(window.accessToken); // Should log 'mocked-token'
  // });

    // Interact with secured areas directly without re-authentication
    // await page.getByRole('button', { name: 'Get user resource' }).click();
    // await page.getByRole('button', { name: 'Get admin resource' }).click();
    // await page.getByRole('button', { name: 'Get m2m resource as \'user\'' }).click();
    // await page.getByRole('button', { name: 'Get m2m resource as \'admin\'' }).click();
    // await page.getByRole('button', { name: 'Get m2m resource using \'' }).click();
    // await page.getByRole('button', { name: 'clear' }).first().click();
    // await page.getByRole('button', { name: 'Get resource using a \'service' }).click();
    // await page.getByRole('button', { name: 'clear' }).nth(1).click();
  });

  test.afterAll(async () => {
    await apiContext.dispose(); // Dispose of the API context if necessary
  });
});
