# Keycloak-SSO demo
## BACK-END applications
&nbsp;
-  **The unprotected-service application**   
   Represents a simple back-end service which is used as a base-line for demo.   
   It serving a number of routes described as following: 
   * "api/messages" - An unprotected route returns a simple message for anyone.   
   * "api/user" - An unprotected route returns a simple message for anyone.   
   * "api/users" - An unprotected route returns a list of users for anyone.   
   * "api/admin" - An unprotected route returns a simple message for anyone.  
&nbsp;
- **The protected-service application**   
   Represents a simple back-end service which is protected by Keycloak. 
   This example intent to demonstrate two types of protection:  
   1. Authentication only - any user recognized by realm can access the resource.   
   2. Authentication and Authorization - any user recognized by realm and have role (assotiated with specific rights) can access the resource.     

   The serving routes described as following: 
   * "api/messages" - Protected route returns a simple message as response for users authenticated by realm.   
   * "api/user" - Protected route returns a simple message as response for all users authenticated by realm with 'user' role.   
   * "api/users" - Protected route returns a list of users for users authenticated by realm. 
   * "api/admin" - Protected route returns a simple message as response for users authenticated by realm with 'administrator' role.  
&nbsp;
- **The protected-m2m-service application**     
   Represents a simple back-end service which is protected by Keycloak while can not be used in user interaction flow(i.e: browser flow).     
   This kind of flow does not involve user login acivity, rather than using 'Bearer token' passed by header in http request, and nence indended for machine to machine communication. 
&nbsp;
- **The protected-sa-service application**      
   Represents a simple back-end service which is protected by Keycloak and use service account for athorization management. 
&nbsp;
- **The api-gateway application**
   * "api/" - Protected route returns a simple message as response for users authenticated by realm.  

### Implementations  

#### NodeJS
- The [unprotected-service](/kc-back-end/kc-unprotected-service) application
- The [protected-service](/kc-back-end/kc-protected-service) application
- The [protected-m2m-service](/kc-back-end/kc-protected-m2m-service) application
- The [protected-sa-service](/kc-back-end/kc-protected-sa-service) application
- The [api-gateway](/kc-back-end/kc-api-gateway) application

#### Python
- (TBD)

