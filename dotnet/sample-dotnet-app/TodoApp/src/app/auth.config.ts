import { AuthConfig } from 'angular-oauth2-oidc';

export const authConfig: AuthConfig = {
  issuer: 'https://auth.egov.city/',
  redirectUri: window.location.origin + '/',
  clientId: 'egov.city',
  scope: 'openid profile email federated:id',
}
