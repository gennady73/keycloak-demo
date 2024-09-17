##################################################
# Authentication/Authorization
##################################################
```bash
export KEYCLOAK_URL=http://localhost:8080

# Get token
ACCESS_TOKEN=$(curl -X POST \
-H "Content-Type: application/x-www-form-urlencoded" \
-d "client_id=kc-back-end-kc-protected-m2m-service-with-service-account" \
-d "client_secret=Q9CXMvfKFNV5tOgFQfMxKKnb5tZzcQoF" \
-d "grant_type=client_credentials" \
-d "audience=kc-front-end-kc-react" \
"${KEYCLOAK_URL}/auth/realms/${KEYCLOAK_REALM}/protocol/openid-connect/token" \
| jq -r '.access_token')

# Groups list
curl -X GET \ 
-H "Accept: application/json" \
-H "Content-Type: application/x-www-form-urlencoded" \
-H "Authorization: Bearer ${ACCESS_TOKEN}" \
"${KEYCLOAK_URL}/auth/admin/realms/keycloak-demo/groups" | jq

# Group overview
curl -X GET \
-H "Accept: application/json" \
-H "Content-Type: application/x-www-form-urlencoded" \
-H "Authorization: Bearer ${ACCESS_TOKEN}" \
"${KEYCLOAK_URL}/auth/admin/realms/keycloak-demo/groups/a12bab52-ac28-47cf-97a1-bf020e4d479a" | jq

# Group permissions (if enabled)
curl -X GET \
-H "Accept: application/json" -H "Content-Type: application/x-www-form-urlencoded" \
-H "Authorization: Bearer ${ACCESS_TOKEN}" \
"${KEYCLOAK_URL}/auth/admin/realms/keycloak-demo/groups/a12bab52-ac28-47cf-97a1-bf020e4d479a/management/permissions" | jq

# Group Members
curl -X GET \
-H "Accept: application/json" \
-H "Content-Type: application/x-www-form-urlencoded" \
-H "Authorization: Bearer ${ACCESS_TOKEN}" \
"${KEYCLOAK_URL}/auth/admin/realms/keycloak-demo/groups/a12bab52-ac28-47cf-97a1-bf020e4d479a/members" | jq

# Role mappings
curl -X GET \
-H "Accept: application/json" \
-H "Content-Type: application/x-www-form-urlencoded" \
-H "Authorization: Bearer ${ACCESS_TOKEN}" \
"${KEYCLOAK_URL}/auth/admin/realms/keycloak-demo/groups/a12bab52-ac28-47cf-97a1-bf020e4d479a/role-mappings" | jq

# Get protected resource

curl -X GET -H "Accept: application/json" \
-H "Content-Type: application/x-www-form-urlencoded" \
-H "Authorization: Bearer ${ACCESS_TOKEN}" \
"http://localhost:3002/api/user" | jq

curl -X GET \
-H "Accept: */*" \
-H 'Content-Type: application/x-www-form-urlencoded' \
-H "Authorization: Bearer ${ACCESS_TOKEN}" \
-Lv --cookie "KEYCLOAK_IDENTITY=${ACCESS_TOKEN}" \
-H "x-forwarded-access-token: ${ACCESS_TOKEN}" \
-H "x-requested -with: XMLHttpRequest"  \
-H "sec-fetch-mode: cors" \
-H 'cache-control: no-cache' \
-H 'connection: keep-alive' \
-H 'host: localhost:3002' \
-H 'origin: http://localhost:5000' \
-H 'referer: http://localhost:5000/' \
-H 'referrer-policy: origin-when-cross-origin' \
"http://localhost:3002/api/user"
```

##################################################
# Impersonation
##################################################
```bash
export KEYCLOAK_URL=http://localhost:8080
export KEYCLOAK_REALM=keycloak-demo

# Get token of impersonator
ACCESS_TOKEN=$(curl -X POST \
-H "Content-Type: application/x-www-form-urlencoded" \
-d "client_id=kc-back-end-kc-protected-m2m-service-with-service-account" \
-d "client_secret=p9L8Vwe24z9KBezXtHXa9qqS8fl1cis9" \
-d "grant_type=client_credentials" \
-d "audience=kc-front-end-kc-react" \
"${KEYCLOAK_URL}/auth/realms/${KEYCLOAK_REALM}/protocol/openid-connect/token" \
| jq -r '.access_token')

# Find a User ID based on the username
USER_NAME=user1
USER_ID=$(curl -X GET -H "Accept: application/json" -H "Authorization: Bearer ${ACCESS_TOKEN}" \
"${KEYCLOAK_URL}/auth/admin/realms/${KEYCLOAK_REALM}/users?username=${USER_NAME}" \
| jq -r '.[].id')

# Impersonate target user
curl --cookie-jar ./impcookie -X POST \
-H "Authorization: Bearer ${ACCESS_TOKEN}" \
-H "Accept: application/json, text/plain, */*" \
"${KEYCLOAK_URL}/auth/admin/realms/${KEYCLOAK_REALM}/users/${USER_ID}/impersonation"

# Obtain a token for an impersonated user
# EXAMPLE
# http://localhost:8080/auth/realms/keycloak-demo/protocol/openid-connect/auth?client_id=kc-front-end-kc-react&redirect_uri=http%3A%2F%2Flocalhost%3A5000%2F&state=f7d3a5d4-2947-4ac0-83f6-d6db018b551d&response_mode=fragment&response_type=code&scope=openid&nonce=766cda9c-293a-41d7-a705-8ddf2482978d&username=user1&password=pwd
# http://localhost:8080/auth/realms/keycloak-demo/protocol/openid-connect/auth?client_id=kc-front-end-kc-react&redirect_uri=http%3A%2F%2Flocalhost%3A5000%2F&response_mode=fragment&response_type=code&scope=openid

# Get cookies and location from response
AUTH_REQ_CLIENT_ID=kc-front-end-kc-react
AUTH_REQ_REDIRECT_URI=http://localhost:5000
curl -v -X GET "${KEYCLOAK_URL}/auth/realms/${KEYCLOAK_REALM}/protocol/openid-connect/auth?response_mode=fragment&response_type=token&scope=openid&client_id=${AUTH_REQ_CLIENT_ID}&origin=${AUTH_REQ_REDIRECT_URI}&redirect_uri=${AUTH_REQ_REDIRECT_URI}" \
--cookie ./impcookie \
--cookie-jar ./login_cookie

# Follow location
curl -v -X GET $LOCATION --cookie ./login_cookie
```

##################################################
# Token exchange
##################################################
```bash
# Exchange
curl -X POST "${KEYCLOAK_URL}/auth/realms/${KEYCLOAK_REALM}/protocol/openid-connect/token" \
-H "Content-Type: application/x-www-form-urlencoded" \
-d grant_type="urn:ietf:params:oauth:grant-type:token-exchange" \
-d subject_token="$ACCESS_TOKEN" \
-d client_id="kc-front-end-kc-react" \
-d requested_subject="user1" \
-d scope="oidc profile email"
```
