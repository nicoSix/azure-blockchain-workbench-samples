import { AuthenticationContext, adalFetch, withAdalLogin } from 'react-adal';

// App Registration ID
const workbenchApiID = '4083c3c9-8e6f-48f8-96ed-f625d2d14322';

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

export const authContextApi = new AuthenticationContext(adalConfigApi);

export const adalApiFetch = (fetch, url, options) =>
  adalFetch(authContextApi, adalConfigApi.endpoints.api, fetch, url, options);

export const withAdalLoginApi = withAdalLogin(new AuthenticationContext(adalConfigApi), workbenchApiID);