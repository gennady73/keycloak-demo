#!/bin/bash
keycloak_host='localhost'
keycloak_port='8080'
realm_name='sso-demo-3'
client_id='oauth2proxy-back-end-service'
client_secret='Y95Nq6XyEXyPvSytov8rt95GEfmRZJxN'

# http(s)://<keycloak host>/auth/realms/<your realm>/protocol/openid-connect
keycloak_base_url="http://${keycloak_host}:${keycloak_port}/auth/realms/${realm_name}/protocol/openid-connect"
echo "keycloak_base_url=$keycloak_base_url"

oauth2p_host=localhost
oauth2p_port=4180

redirect_url="http://localhost:4180/oauth2/callback"
upstream_url='http://localhost:3004/api/user,http://localhost:3004/api/admin' 

# ./oauth2-proxy arguments
cli_args=$(echo  "--provider=keycloak-oidc
	--set-xauthrequest=true	
	--auth-logging=true 
	--pass-authorization-header=true
	--set-xauthrequest=true
	--request-logging=true
	--client-id="${client_id}"
	--client-secret="${client_secret}"
	--cookie-secret="${client_secret}"
   	--redirect-url="${redirect_url}"
	--upstream="${upstream_url}"
	--oidc-issuer-url="http://${keycloak_host}:${keycloak_port}/auth/realms/${realm_name}"
	--email-domain=*
        --show-debug-on-error="true"
        --pass-user-headers="true"
	--skip-jwt-bearer-tokens="false"
        --skip-provider-button="true"
	--skip-auth-preflight="true"
        --pass-access-token="true"
	--code-challenge-method=S256
        --whitelist-domain="localhost:5000 localhost:3004 localhost:4180 localhost:8081 locahost:8080"
        --session-store-type="cookie"
        --cookie-expire="5m"
        --cookie-refresh="3m"
        --scope="openid roles profile email"
        --oidc-extra-audience="aud-mapper-oauth2proxy-back-end-service"
	--insecure-oidc-allow-unverified-email="true"
	--cookie-samesite="none"
	--reverse-proxy="true"	")

# --keycloak-group=<first_allowed_user_group>
# --keycloak-group=<second_allowed_user_group>


./oauth2-proxy $cli_args
