import { Component, OnInit } from '@angular/core';
import { Auth, TokensService, User } from '@agilicus/angular';
import { from, Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';
import jwt_decode from 'jwt-decode';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  public auth: Auth;
  public user$: Observable<User>;

  // These two settings (client-id and issuer) will need to be adjusted.
  // In general, each application should have its own client-id
  // For demo purposes, we have assumed hostname is an existing
  // client-id
  constructor(private tokens: TokensService) {
    let clientId = 'sample-auth';
    let idp = 'https://auth.cloud.egov.city';
    if (window.location.hostname !== 'localhost') {
      clientId = window.location.hostname.split('.')[0];
      const domainSplit = window.location.hostname.split('.');
      const a1 = domainSplit.pop();
      const a2 = domainSplit.pop();
      const a3 = domainSplit.pop();
      idp = 'https://auth.' + a3 + '.' + a2 + '.' + a1;
    }
    this.auth = new Auth(clientId, idp, tokens, 'urn:agilicus:api:files:*?'); //, 'urn:api:agilicus:files:owner');
  }

  public ngOnInit(): void {
    this.user$ = this.auth.user$();
  }

  get bannerImage(): string | null {
    return 'assets/img/Agilicus-Horizontal.svg';
  }
  public async onLoginClick(): Promise<void> {
    await this.auth.login();
  }

  public async onLogoutClick(): Promise<void> {
    await this.auth.logout();
  }

  //
  public getUserRoles(roles: { [key: string]: Array<string> }): string {
    return JSON.stringify(roles);
  }

  public getUser(user: { [key: string]: Array<string> }): string {
    return JSON.stringify(user);
  }

  private decodeToken(token: string): object {
    let decoded = {};
    if (token) {
      decoded = jwt_decode(token);
    }
    return decoded;
  }
  public getAccessToken(): object {
    return this.decodeToken(this.auth.access_token());
  }

  public getIdToken(): object {
    return this.decodeToken(this.auth.id_token());
  }
}
