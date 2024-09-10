// filename: tests/kc-demo.spec.ts
import { test, expect, request, APIRequestContext } from '@playwright/test';

// Configuration
const KEYCLOAK_URL = 'http://localhost:8080';
const KEYCLOAK_REALM = 'keycloak-demo';
const CLIENT_ID = 'kc-back-end-kc-protected-m2m-service-with-service-account';
const CLIENT_SECRET = 'Q9CXMvfKFNV5tOgFQfMxKKnb5tZzcQoF';
const GROUP_ID = 'a12bab52-ac28-47cf-97a1-bf020e4d479a';

let apiContext: APIRequestContext; // Shared context
let accessToken: string;

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
  });

  test('Fetch Group Information and Make API Calls', async ({ page, context }) => {
    const apiHeaders = {
      'Accept': 'application/json',
      'Content-Type': 'application/x-www-form-urlencoded',
      'Authorization': `Bearer ${accessToken}`,
    };

    // Step 3: Fetch Groups list
    const groupsResponse = await apiContext.get(`${KEYCLOAK_URL}/auth/admin/realms/${KEYCLOAK_REALM}/groups`, {
      headers: apiHeaders,
    });
    expect(groupsResponse.ok()).toBeTruthy();
    console.log(await groupsResponse.json());

    // Step 4: Fetch Group overview
    const groupOverviewResponse = await apiContext.get(`${KEYCLOAK_URL}/auth/admin/realms/${KEYCLOAK_REALM}/groups/${GROUP_ID}`, {
      headers: apiHeaders,
    });
    expect(groupOverviewResponse.ok()).toBeTruthy();
    console.log(await groupOverviewResponse.json());

    // Step 5: Fetch Group permissions
    const groupPermissionsResponse = await apiContext.get(`${KEYCLOAK_URL}/auth/admin/realms/${KEYCLOAK_REALM}/groups/${GROUP_ID}/management/permissions`, {
      headers: apiHeaders,
    });
    expect(groupPermissionsResponse.ok()).toBeTruthy();
    console.log(await groupPermissionsResponse.json());

    // Step 6: Fetch Group members
    const groupMembersResponse = await apiContext.get(`${KEYCLOAK_URL}/auth/admin/realms/${KEYCLOAK_REALM}/groups/${GROUP_ID}/members`, {
      headers: apiHeaders,
    });
    expect(groupMembersResponse.ok()).toBeTruthy();
    console.log(await groupMembersResponse.json());

    // Step 7: Fetch Role mappings
    const roleMappingsResponse = await apiContext.get(`${KEYCLOAK_URL}/auth/admin/realms/${KEYCLOAK_REALM}/groups/${GROUP_ID}/role-mappings`, {
      headers: apiHeaders,
    });
    expect(roleMappingsResponse.ok()).toBeTruthy();
    console.log(await roleMappingsResponse.json());

    // Step 8: Get protected resource
    const protectedResourceResponse = await apiContext.get('http://localhost:3002/api/user', {
      headers: apiHeaders,
    });
    expect(protectedResourceResponse.ok()).toBeTruthy();
    console.log(await protectedResourceResponse.json());

    // Step 9: Execute final request in browser context
    await context.addCookies([{
      name: 'KEYCLOAK_IDENTITY',
      value: accessToken,
      domain: 'localhost',
      path: '/',
      httpOnly: true,
      secure: false,
    }]);

    // Go to the relevant page to trigger the request in the browser
    await page.goto('http://localhost:5000/');
    
    // Make a fetch call within the browser context with the necessary headers
    await page.evaluate(async (token) => {
      const response = await fetch('http://localhost:3002/api/user', {
        method: 'GET',
        headers: {
          'Accept': '*/*',
          'Content-Type': 'application/x-www-form-urlencoded',
          'Authorization': `Bearer ${token}`,
          'x-forwarded-access-token': token,
          'x-requested-with': 'XMLHttpRequest',
          'sec-fetch-mode': 'cors',
          'cache-control': 'no-cache',
          'connection': 'keep-alive',
          'origin': 'http://localhost:5000',
          'referer': 'http://localhost:5000/',
        },
      });
      const data = await response.json();
      console.log(data);
    }, accessToken);
  });

  test.afterAll(async () => {
    await apiContext.dispose(); // Dispose of the API context if necessary
  });
});
