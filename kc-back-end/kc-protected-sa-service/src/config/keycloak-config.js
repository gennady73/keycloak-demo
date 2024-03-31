import session from 'express-session';
import Keycloak from 'keycloak-connect';

let keycloak;

function initKeycloak(memoryStore) {
    if (keycloak) {
        console.log("Use existing Keycloak instance.");
        
        return keycloak;
    }
    else {
        console.log("Initializing Keycloak...");
        
        keycloak = new Keycloak({
            secret: "any_key",
            store: memoryStore,
            resave: false,
            saveUninitialized: true
        }, 'src/config/keycloak.json');
        
        return keycloak;
    }
}

export default initKeycloak;
