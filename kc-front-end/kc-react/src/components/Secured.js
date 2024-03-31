import React, { useState, createContext, useEffect} from 'react';
import Keycloak from 'keycloak-js';

export const AuthContext = createContext({});


var kc = undefined;
var kcPromise = undefined;
var kcIinitialized = false;

const useKeycloak = () => {

    if (!kc) {
        kc = new Keycloak('./keycloak.json');
        kc.onTokenExpired = function() {
            console.log('<<< ON TOKEN EXPIRED >>>');
            kc.updateToken(-1);
        }
        kc.onAuthRefreshSuccess = function() {
            console.log('<<< ON TOKEN REFRESH SUCCESS >>>');
            window.accessToken = kc.token;
            window.idToken = kc.idToken;
        }
        kc.onAuthRefreshError = function() {
            console.error('<<< ON TOKEN REFRESH ERROR >>>');
        }
    }
    if(!kcPromise && !kcIinitialized) {
        // init options: login-required | check-sso
        kcIinitialized = true;
        kcPromise = kc.init({ onLoad: 'check-sso', enableLogging: true, refreshToken: true });
        
    }
    return { kc, kcPromise };
}

function Secured({ children }) {
    const { kc, kcPromise } =  useKeycloak();
    const [keycloak, setKeycloak] = useState(null);

    useEffect(() => {
        
        kcPromise
            .then((authenticated) => {
                
                kcIinitialized = true;
                console.log(`initialized: ${kcIinitialized}, authenticated: ${authenticated} .`);
                setKeycloak(kc);

                if (authenticated) {
                    
                    window.accessToken = kc.token;
                    window.idToken = kc.idToken;
                }
                else {
                    window.accessToken = undefined;
                    window.idToken = undefined;
                }
            })
            .catch((error) => {
                console.error('keycloak init failed');
                console.log(error);
            })
            .finally(() => {
                return kc;
            });

    }, [kc, kcPromise]);

    return (
        <AuthContext.Provider value={{ keycloak, setKeycloak }}>
            {keycloak ?
            
                <div>
                    {keycloak.authenticated ?
                        <>
                        <div className='App-header'>
                            {/* <p>This is a keycloak-secured component of your application.</p> */}
                            <button onClick={() => keycloak.logout()}>logout</button>
                            <p>{keycloak.tokenParsed.preferred_username}</p>
                            <hr></hr>
                        </div>
                        <div className='App-content'>
                            { children && <div>{children}</div> }
                        </div>
                        </>
                        :
                        <>
                        <div className='App-header'>
                            {/* <p>Unable to authenticate!</p> */}
                            <button onClick={() => keycloak.login()}>login</button>
                        </div>
                        <hr></hr>
                        <div className='App-content'>
                            <img src='./logo.jpg' className='App-logo' alt='logo' />
                        </div>
                        </>
                    }
                </div>
                :
                <div>
                    <div className='App-header'><p>Initializing Keycloak...</p>
                        <button onClick={() => {
                            window.location.reload(false);
                            }}>
                            Refresh
                        </button>
                    </div>
                    <hr></hr>
                    <div className='App-content'>
                        <img src='./logo.jpg' className='App-logo' alt='logo' />
                    </div>
                </div>
            }
        </AuthContext.Provider>
    );
}

export default Secured;