export const environment = {
  mode: 'development',
  baseUrl: 'http://localhost:8081',
  oidc: {
    issuer: 'http://localhost:8082/realms/quarkus',
    clientId: 'quarkus-app',
    scope: 'openid',
    redirectUri: window.location.origin + '/',
    requireHttps: true,
  },
};
