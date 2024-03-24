import session from 'express-session';
import Keycloak from 'keycloak-connect';

let keycloak;

function initKeycloakM2M(memoryStore) {
    if (keycloak) {
        console.log("Use existing m2m Keycloak instance.");
        
        return keycloak;
    }
    else {
        console.log("Initializing m2m Keycloak...");
        
        keycloak = new Keycloak({
            secret: "xxx",
            resave: true,
            saveUninitialized: true
        }, 'src/config/keycloak-m2m.json');

        return keycloak;
    }
}

export default initKeycloakM2M;