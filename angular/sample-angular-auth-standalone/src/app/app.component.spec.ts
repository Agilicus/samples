import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { OAuthModule } from 'angular-oauth2-oidc';
import { AppComponent } from './app.component';
import { authConfig } from './auth.config'

describe('AppComponent', () => {
  var httpController: HttpTestingController
  const discoveryDoc =  `${authConfig.issuer}/.well-known/openid-configuration`
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [
        AppComponent,
      ],
      imports:[
        OAuthModule.forRoot(),
        HttpClientTestingModule,
      ]
    }).compileComponents();
    httpController = TestBed.inject(HttpTestingController)
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });

  it(`should have as title 'sample-angular-auth-standalone'`, () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.componentInstance;
    expect(app.title).toEqual('sample-angular-auth-standalone');
  });
});
