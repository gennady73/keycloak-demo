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
            store: memoryStore,
            secret: 'any_key', 
            resave: false,
            saveUninitialized: true
        }, 'src/config/keycloak.json');
        
        return keycloak;
    }
}

export default initKeycloak;