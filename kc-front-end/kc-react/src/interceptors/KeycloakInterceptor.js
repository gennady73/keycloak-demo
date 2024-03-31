import axios from 'axios';
import axiosRetry from 'axios-retry';

const initAxiosInstance = () => {
    
    const axiosInstance = axios.create();
    
    axiosInstance.defaults.maxRedirects = 0; // Set to 0 to prevent automatic redirects
    axiosInstance.defaults.headers.common['X-Requested-With'] = 'XMLHttpRequest';
    
    axiosRetry(axiosInstance, {
        retries: 6, // number of retries
        retryDelay: (retryCount) => {
            console.log(`retry attempt: ${retryCount}`);
            return retryCount * 5000; // time interval between retries
        },
        retryCondition: (error) => {
            // if retry condition is not specified, by default idempotent requests are retried
            if (error.response && error.response.status === 503) return true;
            else if (error.code && error.code === 'ERR_NETWORK') return true; 
        },
    });
    
    axiosInstance.interceptors.request.use(
        async config => {
    
            const token = window.accessToken ? window.accessToken : 'dummy_token';
            config.headers['Authorization'] = 'Bearer ' + token;
            config.headers['Referrer-Policy'] = 'origin-when-cross-origin';

            const idToken = window.idToken ? window.idToken : 'dummy_id_token';
            config.headers['X-Forwarded-Access-Token'] = idToken;

            config.headers['Cache-Control'] = 'no-cache';

            console.log('headers set');
            return config;

        },
        error => {
            console.log('interceptor config error: ', error);
            return Promise.reject(error.response? error.response : error);
        });

    axiosInstance.interceptors.response.use((response) => {
        console.log('interceptor response: ', response.status);
        return response
    },
    error => {
        console.log('interceptor error: ', error.response && error.response.status);
        if (error.response && [301, 302].includes(error.response.status)) {
            const redirectUrl = error.response.headers.location;
            return axiosInstance.get(redirectUrl);
        }

        return Promise.reject(error.response? error.response : error);
    });

    return axiosInstance;
}

export { initAxiosInstance };
