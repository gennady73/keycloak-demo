# Keycloak-SSO demo (workshop)

This workshop(and guides) were created in intent to learn the basics of working with SSO server using RHSSO v7.6.4.GA (aka Keycloak).

### Prerequisites:

- The Keycloak server (RHSSO v7.6.4.GA) must be up and running on th local machine (localhost:8080).
- The realm configuration is imported from [realm-export.json](assets/realm-export.json) file as well.
- NodeJS v.16+ with npm package manager. 
- Some IDE (e.g VSCode).

### Setup:

1. Get project from repository (git clone). 
2. Start RHSSO(Keycloak) services
    Navigate to the setup/containers directory from the root of project.
    Run ```docker-compose up -d``` or ```podman-compose up -d```
    *Note:* For the first run, the restart of the RHSSO container may be required:
    ```docker-compose restart rh-sso-server-ha1 -d```
3. Project setup
   Navigate to the setup/apps directory from the root of project.
   Run ```install_all.sh``` or ```install_all.bat``` - for details, see [here](setup/apps/README.md)

4. Ater the setup completion, the services and applications must be available at ther own locations as following: 

    | application/service        | Base URL                            | Sub paths                          |
    |----------------------------|-------------------------------------|------------------------------------|
    | kc-protected-sa-service    | `http://localhost:3005/api`     | `/user, /admin, /messages`     |
    | kc-protected-m2m-service   | `http://localhost:3004/api`     | `/user, /admin, /messages`     |
    | kc-unprotected-service     | `http://localhost:3003/api`     | `/messages`                    |
    | ~~kc-api-gateway~~         | ~~`http://localhost:3003/api`~~ |                                    |
    | kc-react                   | `http://localhost:5000`         |                                    |
    | RHSSO (Keycloak)           | `http://localhost:8080/auth`    |                                    |

    *Note:* The `.../api` and `/messages` paths are unprotected in all services



5. Credentials

    * RHSSO(Keycloak) server   
        *user:* `admin`        
        *password:* `admin`

    * Realm user credentials    
        *user:* `user1`, `user2`, `user3`   
        *password:* `pwd`



### Using guides:

This workshop is built around a demo project that showcases multiple ways to integrate applications with Single Sign-On (SSO) using RH-SSO.

To help participants understand both the development and configuration aspects of SSO, the project is accompanied by two complementary guides. Each guide covers the same features and flows implemented in the demo, but from a different perspective:

- [RHSSO Developer Guide](docs/dev/RHSSO_Developer_Guide.md) - Focuses on how SSO is integrated into the application code. It explains authentication flows, token handling, and front-end/back-end interactions from a developer's point of view.

- [RHSSO Configuration Guide](docs/keycloak/RHSSO_Configuration_Guide.md) - Explains how to configure Keycloak to support those flows. It covers client setup, roles, realms, mappers, and other configuration steps from the perspective of an administrator.


### Code:    
- [Front-end applications](kc-front-end/README.md)    
- [Back-end applications](kc-back-end/README.md)  


### Advanced topics:
- [Red Hat Single Sign-On (RHSSO) High-Availability](docs/xsite/README.md) - setting up a Red Hat Single Sign-On (RHSSO) high-availability (HA) in various configurations.

### Note: 
Some sections are still under development.

2023 - 2025
