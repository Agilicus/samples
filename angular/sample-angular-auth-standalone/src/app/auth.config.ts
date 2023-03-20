
import { AuthConfig } from 'angular-oauth2-oidc';

export const authConfig: AuthConfig = {
  // The URL of your IdP (e.g. auth.subdomain)
  issuer: "https://auth.yourdomain.example.com",

  // Where to go after logging in
  redirectUri: window.location.origin + '/',

  // This will likley match your app name. E.g. `'your-app-name'`
  clientId: 'simple-auth-example',
  responseType: 'code',

  // The final scope gives you access to the user's permissions for this app. Replace it
  // with something like `urn:agilicus:app<your-app-name>:*`
  scope: 'openid profile email offline_access urn:agilicus:app:simple-auth-example:*',

  // Turn this off in prod. Just for testing
  showDebugInformation: true,

  sessionChecksEnabled: false,

  checkOrigin: true,

  // Refresh when the token is halfway to expiring
  timeoutFactor: 0.5
};
