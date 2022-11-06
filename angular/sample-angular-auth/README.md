# SampleAngularAuth

This project was generated with [Angular CLI](https://github.com/angular/angular-cli) version 9.1.9.

It uses the [Agilicus Angular SDK](https://www.npmjs.com/package/agilicus-angular),
which is [documented](https://agilicus.storage.googleapis.com/sdk/angular/index.html),
and the underlying API is [documented](https://agilicus.storage.googleapis.com/api/index.html).

Add the `agilicus-angular` (npm add --save agilicus-angular) to your project.

The flow demonstrated is trivial: Login, Logout.

In `app.component.ts`, we have added:

```
  constructor(tokens: TokensService) {
    this.auth = new Auth(
      'app-1',
      'https://auth.cloud.egov.city',
      tokens
    );
  }
```
You will need to modify the first (app-1) to be your client-id. In general,
each application should have a separate client-id configured.
The 2nd (https://auth...) should be set to your issuer.

To this we have augmented:

```
  public ngOnInit(): void {
    this.user$ = this.auth.user$();
  }

  public async onLoginClick(): Promise<void> {
    await this.auth.login();
  }

  public async onLogoutClick(): Promise<void> {
    await this.auth.logout();
  }
```

Here we simply print the user roles. Other methods are available to get
e.g. the User Name, Email, External-ID (e.g. employee ID), and the Access Token.

## Development server

Run `ng serve` for a dev server. Navigate to `http://localhost:4200/`. The
app will automatically reload if you change any of the source files.

## Code scaffolding

Run `ng generate component component-name` to generate
a new component. You can also use
`ng generate directive|pipe|service|class|guard|interface|enum|module`.

## Build

Run `ng build` to build the project. The build artifacts will be stored
in the `dist/` directory. Use the `--prod` flag for a production build.

## Running unit tests

Run `ng test` to execute the unit tests via
[Karma](https://karma-runner.github.io).

## Running end-to-end tests

Run `ng e2e` to execute the end-to-end tests via
[Protractor](http://www.protractortest.org/).

## Further help

To get more help on the Angular CLI use `ng help` or go check out the
[Angular CLI README](https://github.com/angular/angular-cli/blob/master/README.md).
