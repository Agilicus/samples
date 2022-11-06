import { Title } from '@angular/platform-browser';
import { Component, OnInit } from '@angular/core';
import { BusinessService } from '../app/business.service';

import { OAuthService } from 'angular-oauth2-oidc';

import { JwksValidationHandler } from 'angular-oauth2-oidc';
import { AuthService } from './auth.service';

import { RbacService } from './rbac.service';

import {
  Event,
  Router
} from '@angular/router';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {

  title = 'sample-angular-app';
  logo = require('../assets/shield.png');
  version = {};
  shield = require('../assets/shield.png');

  constructor(private _router: Router,
              private bs: BusinessService,
              private rbac: RbacService,
              private oauthService: OAuthService,
              private authService: AuthService,
              private titleService: Title) {
    this._router.events.subscribe((event: Event) => {
      this.navigationInterceptor(event);
    });
  }
  public setTitle( newTitle: string) {
      this.titleService.setTitle( newTitle );
  }

  public get role() {
    if (!this.rbac.rbac) {
       return null;
    }
    return this.rbac.rbac.roles['app-1'];
  }
  public get first() {
    if (!this.rbac.rbac) {
      return null;
    }
    return this.rbac.rbac.first_name;
  }
  public get last() {
    if (!this.rbac.rbac) {
      return null;
    }
    return this.rbac.rbac.last_name;
  }
  public get email() {
    if (!this.rbac.rbac) {
      return null;
    }
    return this.rbac.rbac.email;
  }
  public get provider() {
    if (!this.rbac.rbac) {
      return null;
    }
    return this.rbac.rbac.provider;
  }

  public login() {
      this.oauthService.initImplicitFlow();
  }

  public logoff() {
      this.rbac.logout();
      this.oauthService.logOut();
      this._router.navigate(['']);
  }

  private configureWithNewConfigApi() {
    this.oauthService.configure(this.authService.authConfig);
    this.oauthService.tokenValidationHandler = new JwksValidationHandler();
    this.oauthService.loadDiscoveryDocumentAndTryLogin({
      onTokenReceived: context => {
        this.rbac.getRbac(context.idToken).subscribe(
          v => {
            this.rbac.rbac = v;
          }
        );
      }
    });
  }

  ngOnInit() {
    this.configureWithNewConfigApi();
    this.bs
      .getVersion()
      .subscribe((data) => {
        this.version = data;
      });
  }
  private navigationInterceptor(event: Event): void {
  }
}
