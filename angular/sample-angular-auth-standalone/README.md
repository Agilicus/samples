# SampleAngularAuthStandalone

This project provides an example of integrating with an [OpenID Connect](https://openid.net/connect/) provider (particularly an Agilicus one) for an
angular application. This is useful for retrieving user profile information and an access token which may be used to interact with an API.

## Design

The application is extremely simple: if a user is logged in, it displays some simple information about them. Otherwise, it prompts the user to log in.
The application will try to silently refresh when the tokens are near expiry.

The actual authentication heavy lifting is done by the [angular-oauth2-oidc](https://github.com/manfredsteyer/angular-oauth2-oidc) library.

In this simple app, all the work is done in the main app.component module. Larger applications should refactor the authentication
logic out into its own module or service.

The auth subsystem is initialised in the constructor. The template depends primarily on a single observable which indicates whether
the user is logged in as well as their properties.

## Testing

1. Choose your identity provider. Make sure you know your client id in that IdP.
2. Edit src/app/auth.config.ts to set the issuer to the IdP's URL.
3. Edit src/app/auth.config.ts to set the clientId.
4. Perform other customisations (e.g. scopes, debug level, etc) to src/app/auth.config.ts
5. Run `ng serve` for a dev server. Navigate to `http://localhost:4200/`. The application will automatically reload if you change any of the source files.

## Running unit tests

Run `ng test` to execute the unit tests via [Karma](https://karma-runner.github.io).

## Running end-to-end tests

Run `ng e2e` to execute the end-to-end tests via a platform of your choice. To use this command, you need to first add a package that implements end-to-end testing capabilities.
