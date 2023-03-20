import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { MatExpansionModule  } from '@angular/material/expansion';
import { OAuthModule, OAuthStorage } from 'angular-oauth2-oidc';

import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { HttpClientModule } from '@angular/common/http';

export function storageFactory() : OAuthStorage {
  return localStorage
}

@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule,
    MatExpansionModule,
    MatInputModule,
    FormsModule,
    ReactiveFormsModule,
    HttpClientModule,
    BrowserAnimationsModule,
    // Import the auth module
    OAuthModule.forRoot(),
  ],
  providers: [
    // Set up the auth module to use local storage so that the session persists. You  can
    // choose to do this differently e.g. session storage (default) or translate the token
    // in to a cookie which can be redeemed for a session-scoped token by your backend.
    {provide: OAuthStorage, useFactory: storageFactory}
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
