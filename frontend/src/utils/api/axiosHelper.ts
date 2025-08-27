import type { AxiosInstance } from 'axios';
import axios from 'axios';
import { jwtHelper } from '../auth/jwtHelper';
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
      console.error('Request interceptor error:', error);
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

const configureResponseInterceptor = (axiosInstance: AxiosInstance, navigate: NavigateFunction) => {
  axiosInstance.interceptors.response.use(
    (response) => {
      // Check for notifications header
      const hasNotifications = response.headers['hasnotifications'];
      if (hasNotifications === 'true') {
        // Trigger notification check in the app
        window.dispatchEvent(new CustomEvent('hasNotifications', { detail: true }));
      }
      return response;
    },
    async (error) => {
      const currentRoute = window.location.pathname + window.location.search;

      if (error.response) {
        const status = error.response.status;
        const headers = error.response.headers;

        if (status === 401) {
          const reason = headers['401-reason'];
          
          if (reason === 'JWT_EXPIRED') {
            // Try to refresh token
            const refreshToken = jwtHelper.getRefreshToken();
            if (refreshToken && !jwtHelper.isTokenExpired(refreshToken)) {
              try {
                const response = await axios.post(`${import.meta.env.VITE_API_BASE_URL}/api/auth/refresh`, {
                  refreshToken
                });
                
                if (response.data.success) {
                  jwtHelper.setJWTToken(response.data.accessToken);
                  jwtHelper.setRefreshToken(response.data.refreshToken);
                  
                  // Retry the original request
                  const originalRequest = error.config;
                  originalRequest.headers.authorization = `Bearer ${response.data.accessToken}`;
                  return axios(originalRequest);
                }
              } catch (refreshError) {
                console.error('Token refresh failed:', refreshError);
              }
            }
            
            // If refresh fails, redirect to login
            jwtHelper.clearAll();
            navigateTo(navigate, currentRoute, '/login');
          } else {
            navigateTo(navigate, currentRoute, '/unauthorized');
          }
        } else if (status === 403) {
          const reason = headers['403-reason'];
          const xErrorType = headers['x-error-type'];

          if (xErrorType === 'INSUFFICIENT_ROLES') {
            navigateTo(navigate, currentRoute, '/forbidden');
          } else if (reason === 'WALLET_NOT_VERIFIED') {
            navigateTo(navigate, currentRoute, '/verify-wallet');
          } else {
            navigateTo(navigate, currentRoute, '/forbidden');
          }
        } else {
          const errorUrl = error.response.config?.url || 'unknown';
          const errorPageUrl = `/errors?errorurl=${encodeURIComponent(errorUrl)}&status=${status}`;
          navigate(errorPageUrl);
        }
      } else {
        // Network error or other issues
        navigate('/errors?status=network');
      }

      return Promise.reject(error);
    },
  );
};

const createSecuredAxiosInstance = (navigate: NavigateFunction) => {
  const securedAxiosInstance = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL,
    timeout: 30000, // 30 seconds
    headers: { 'Content-Type': 'application/json' },
    validateStatus: function (status) {
      return (status >= 200 && status < 300) || status === 422;
    },
  });

  configureTokenBearerRequestInterceptor(securedAxiosInstance);
  configureResponseInterceptor(securedAxiosInstance, navigate);
  return securedAxiosInstance;
};

const createUnsecuredAxiosInstance = (navigate: NavigateFunction) => {
  const unsecuredAxiosInstance = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL,
    timeout: 30000, // 30 seconds
    headers: { 'Content-Type': 'application/json' },
    validateStatus: function (status) {
      return (status >= 200 && status < 300) || status === 422;
    },
  });

  configureResponseInterceptor(unsecuredAxiosInstance, navigate);
  return unsecuredAxiosInstance;
};

export const axiosHelper = {
  createSecuredAxiosInstance,
  createUnsecuredAxiosInstance
};