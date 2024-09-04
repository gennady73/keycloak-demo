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
