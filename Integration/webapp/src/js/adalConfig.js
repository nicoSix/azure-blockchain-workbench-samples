import { AuthenticationContext, adalFetch, withAdalLogin } from 'react-adal';

// App Registration ID
const workbenchApiID = '<your Workbench App ID here>';

// API Configuration
export const adalConfigApi = {
  cacheLocation: 'localStorage',
  clientId: workbenchApiID,
  endpoints: {
      api: workbenchApiID
  },
  tenant: 'microsoft.onmicrosoft.com',
  redirectUri: window.location.origin + '/',
  postLogoutRedirectUri: window.location.origin + '/',
};

// Authentication Context definition (contains cookies, tokens ...)
export const authContextApi = new AuthenticationContext(adalConfigApi);

// API Fetch function definition
export const adalApiFetch = (fetch, url, options) =>
  adalFetch(authContextApi, adalConfigApi.endpoints.api, fetch, url, options);

// HOC Login if needed when accessing to a restricted page
export const withAdalLoginApi = withAdalLogin(new AuthenticationContext(adalConfigApi), workbenchApiID);