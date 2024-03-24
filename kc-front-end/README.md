# Keycloak-SSO demo
## FRONT-END application (React)
Represents a simple front-end application which is implements an authentication against Keycloak using public client(in browser).   
In addition, application aggregates functionality from several back-end services demontrating a various protection flows including authentiaction/authorization processes.   
The data requested by application from the back-end services is retrieved from the followiing routes:
* "api/messages"   
* "api/user"   
* "api/users"   
* "api/admin"  

While the nature of React application is JS-based browser application, it uses a Piblic client. In contrast, the back-end services uses a different Client Access Types mentioned below. 
The following are Client Access Types used by back-end services in demo application:
* "Bearer-only"    
* "Confidential"
&nbsp;  

| Project name | Client Access Type |
| ----------- | ----------- |
| [kc-react](/kc-front-end/kc-react) | Public |
| [kc-protected-service](kc-back-end/kc-protected-service) | Bearer |
| [kc-protected-m2m-service](kc-back-end/kc-protected-m2m-service) | Confidential |
| [kc-protected-sa-service](kc-back-end/kc-protected-sa-service) | Confidential |
| [kc-api-gateway](kc-back-end/kc-api-gateway) | Bearer |
| [kc-unprotected-service](kc-back-end/kc-unprotected-service) | None |

&nbsp;  
...