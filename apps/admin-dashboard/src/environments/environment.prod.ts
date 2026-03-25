export const environment = {
  mode: 'production',
  baseUrl: 'https://nx-angular-admin-vu22n.ondigitalocean.app',
  oidc: {
    issuer: 'https://keycloak.yourdomain.com/realms/quarkus',
    clientId: 'web_app',
    scope: 'openid profile email',
    redirectUri: 'https://nx-angular-admin-vu22n.ondigitalocean.app/',
    requireHttps: true,
  },
};
