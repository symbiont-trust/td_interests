import type { AxiosInstance } from 'axios';
import axios from 'axios';
import { jwtHelper } from '../jwt/jwtHelper';
import type { NavigateFunction } from 'react-router-dom';

const configureTokenBearerRequestInterceptor = (axiosInstance: AxiosInstance) => {
  axiosInstance.interceptors.request.use(
    async (config: any) => {
      const jwtToken: string | null = jwtHelper.getJWTToken();

      if (jwtToken != null) {
        config.headers = {
          ...config.headers,
          authorization: `Bearer ${jwtToken}`,
        };
      }

      return config;
    },
    (error) => {
      console.error(error);
      return Promise.reject(error);
    },
  );
};

const navigateTo = (
  navigate: NavigateFunction,
  currentRoute: string,
  url: string
) => {
  const encodedRoute = encodeURIComponent(currentRoute);
  const separator = url.includes('?') ? '&' : '?';
  const urlToNavigateTo = `${url}${separator}currentRoute=${encodedRoute}`;
  navigate(urlToNavigateTo);
};


const configureResponseInterceptor
  = (axiosInstance: AxiosInstance, navigate: NavigateFunction) => {
    axiosInstance.interceptors.response.use(
      (response) => {
        return response;
      },
      (error) => {
        const currentRoute = window.location.pathname + window.location.search;
        // console.log('currentRoute: ', currentRoute);

        if (error.response && error.response.data === 'JWT expired') {
          navigateTo( navigate, currentRoute, '/login' );
        }
        else if (error.response) {
          const status = error.response.status;

          if (status === 403) {
            const headers = error.response.headers;
            const reason = headers['403-reason'];

            if (!!reason && reason === 'Awaiting Email Activation') {
              navigate("/register/email-instructions");
            }

            const xErrorType = headers['x-error-type'];

            if (xErrorType === 'JWT_EXPIRED') {
              navigateTo( navigate, currentRoute, '/session-expired');
            }
            else {
              navigateTo( navigate, currentRoute, '/forbidden');
            }
          }
          else if (status === 401) {
            const headers = error.response.headers;
            const reason = headers['401-reason'];

            if (!reason || reason !== 'Incorrect Credentials') {
              // navigate('/unauthorized');
              navigateTo( navigate, currentRoute, '/unauthorized');
            }
          }
          else {
            const errorUrl = error.response.config.url;
            const status = error.response.request.status;
            const errorPageUrl = '/errors?errorurl=' + errorUrl + '&status=' + status;
            navigate(errorPageUrl);
          }
        }

        return Promise.reject(error);
      },
    );
  };

const createSecuredAxiosInstance = (navigate: NavigateFunction) => {

  const securedAxiosInstance = axios.create({
    baseURL: import.meta.env.VITE_BASE_URL,
    timeout: import.meta.env.VITE_TIMEOUT,
    headers: { 'Content-Type': 'application/json' },
    validateStatus: function (status) {
      return (status >= 200 && status < 300) || status === 422; //  || status === 401;
    },
  });

  configureTokenBearerRequestInterceptor(securedAxiosInstance);
  configureResponseInterceptor(securedAxiosInstance, navigate);
  return securedAxiosInstance;
}

const createUnsecuredAxiosInstance = (navigate: NavigateFunction) => {

  const unSecuredAxiosInstance = axios.create({
    baseURL: import.meta.env.VITE_BASE_URL,
    timeout: import.meta.env.VITE_TIMEOUT,
    headers: { 'Content-Type': 'application/json' },
    validateStatus: function (status) {
      return (status >= 200 && status < 300) || status === 422; // || status === 401;
    },
  });

  configureResponseInterceptor(unSecuredAxiosInstance, navigate);
  return unSecuredAxiosInstance;
}

export const axiosHelper = {
  createSecuredAxiosInstance,
  createUnsecuredAxiosInstance
};
