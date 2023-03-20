import { Component } from '@angular/core';
import { OAuthService } from 'angular-oauth2-oidc';
import { filter, from, map, Observable } from 'rxjs';
import { authConfig } from './auth.config';

interface User {
  name?: string
  email?: string
  id?: string
}

interface LoginInfo {
  access_token: string
  id_token: string
  user: User
}

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title: string = 'sample-angular-auth-standalone';
  info$: Observable<LoginInfo> | undefined
  loggedIn: Observable<boolean>

  constructor(private oauthService: OAuthService) {
    // Configure the oauth service. This must be done before trying to log in.
    this.oauthService.configure(authConfig)
    this.oauthService.setupAutomaticSilentRefresh()

    // Build an observable which tells use whether the user is logged in based on the oauth
    // service automatically validating any existing access tokens.
    this.loggedIn = from(this.oauthService.loadDiscoveryDocumentAndTryLogin()).pipe(
      map(() => this.oauthService.hasValidAccessToken() && this.oauthService.hasValidIdToken()
      )
    )
    
    // Just for debugging what's going on. Feel free to remove.
    this.oauthService.events.subscribe((e) => {
      // tslint:disable-next-line:no-console
      console.log('oauth/oidc event', e);
    });
  }

  public ngOnInit() {
      // Build an observable of the user's information which emits once we know the user
      // is logged in (and thus we have the info).
      this.info$ = this.loggedIn.pipe(
        filter((loggedIn) => loggedIn),
        map((_) => {
          const claims = this.oauthService.getIdentityClaims()
          const user: User =  {
            name: claims["name"],
            email: claims["email"],
            id: claims["sub"],
          }
          const result: LoginInfo = {
            access_token: this.oauthService.getAccessToken(),
            id_token: this.oauthService.getIdToken(),
            user: user,
          }
          return result
        })
      )
  }

  public onLoginClick() {
    // This actually triggers logging in.
    this.oauthService.initCodeFlow()
  }

  public onLogoutClick() {
    this.oauthService.logOut()
  }
  get bannerImage(): string | null {
    return 'assets/img/Agilicus-Horizontal.svg';
  }
}
