# Keycloak-SSO demo (workshop)

This workshop(and guides) were created in intent to learn the basics of working with SSO server using RHSSO v7.6.4.GA (aka Keycloak).

### Prerequisites:

- The Keycloak server (RHSSO v7.6.4.GA) must be up and running on th local machine (localhost:8080).
- The realm configuration is imported from [realm-export.json](assets/realm-export.json) file as well.
- NodeJS v.16+ with npm package manager. 
- Some IDE (e.g VSCode).


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
