import { AuthenticationContext, adalFetch, withAdalLogin } from 'react-adal';

// App Registration ID
const workbenchApiID = '4083c3c9-8e6f-48f8-96ed-f625d2d14322';
const workbenchDBApiID = '6802d2de-23b3-4e58-a818-b8954ffb43db';

export const adalConfigApi = {
  cacheLocation: 'localStorage',
  clientId: workbenchApiID,
  endpoints: {
      api: workbenchApiID,
      db_api: workbenchDBApiID
  },
  tenant: 'microsoft.onmicrosoft.com',
  redirectUri: window.location.origin + '/',
  postLogoutRedirectUri: window.location.origin + '/',
};

export const adalConfigDBApi = {
  cacheLocation: 'localStorage',
  clientId: workbenchDBApiID,
  endpoints: {
      api: workbenchApiID,
      db_api: workbenchDBApiID
  },
  tenant: 'microsoft.onmicrosoft.com',
  redirectUri: window.location.origin + '/',
  postLogoutRedirectUri: window.location.origin + '/',
};

export const authContextApi = new AuthenticationContext(adalConfigApi);
export const authContextDBApi = new AuthenticationContext(adalConfigDBApi);

export const adalApiFetch = (fetch, url, options) =>
  adalFetch(authContextApi, adalConfigApi.endpoints.api, fetch, url, options);

export const adalDBApiFetch = (fetch, url, options) =>
  adalFetch(authContextApi, adalConfigApi.endpoints.db_api, fetch, url, options);

export const withAdalLoginApi = withAdalLogin(new AuthenticationContext(adalConfigApi), workbenchApiID);
export const withAdalLoginDBApi = withAdalLogin(new AuthenticationContext(adalConfigDBApi), workbenchDBApiID);