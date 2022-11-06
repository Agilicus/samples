## sample-angular-app

All information in this repository (code,
documentation, etc.) is released under the 
[Apache 2.0 License](https://www.apache.org/licenses/LICENSE-2.0)

1. Install Mongodb
`sudo apt install -y mongodb mongodb-server-core`

2. Build angular app
```
npm i
ng build
```

3. Run API / webserver

```
cd api
npm i
./node_modules/.bin/nodemon server
```

## Run

Method 1: Open browser http://localhost:4000 [this will go all to the API, including web serving]

Method 2:
```
ng serve
```
Open browser to http://localhost:4200 [this will proxy through angular's dev front end]


## Notes

This sample uses `angular-oauth2-oidc` to provide the OpenID Connect.
It does not use an _environment_ config, instead it has hard-coded URL's within
it. The OpenID Connect is configured in auth.config.ts. The main items to configure are:

  - issuer (URL)
  - clientId (string)

The other 2 components of the authentication/authorisation path are in rbac.service.ts
(showing the use of the `whoami` endpoint to exchange the ID Token for an RBAC
role information and an access token), and in auth.interceptor.ts (showing the 
placement of the access token on all URL *except* the issuer. You may need to
use a different filter here (e.g. place it *only* on certain URL rather than
the reverse).

