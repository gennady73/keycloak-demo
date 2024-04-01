# Keycloak-SSO demo 

This guide was created in intent to learn the basics of working with SSO using RHSSO v7.6.4.GA as Keycloak server.

### Prerequisites:

- The Keycloak server (RHSSO v7.6.4.GA) must be up and running on th local machine (localhost:8080).
- The realm configuration is imported from [realm-export.json](assets/realm-export.json) file as well.
- NodeJS v.16+ with npm package manager. 
- Some IDE (e.g VSCode).


### Using guides:

The guide consists of the following parts while both has same subjects(paragraphs).
However, each one of them explains these subjects from different perspective:     

- [RHSSO Developer Guide](docs/dev/RHSSO_Developer_Guide.md) - Explains the flows from appliation/coding perspective.
  
- [RHSSO Developer Guide Keycloak](docs/keycloak//RHSSO_Developer_Guide_Keycloak.md) - Explains the flows from Keycloak setup (Client,Role,etc.) perspective.
  

### Code:    
- [Front-end applications](kc-front-end/README.md)    
- [Back-end applications](kc-back-end/README.md)  

### Note: 
Some sections are still under develomplent.

2023