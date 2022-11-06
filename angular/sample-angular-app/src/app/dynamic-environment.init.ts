/*
 * Given an (optional) environment override file in assets/app-config.json,
 * merge it in to the global environment which is compiled in.
 */
import { Injectable } from '@angular/core';
import { from } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment as env } from '../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class DynamicEnvironmentService {
  override: object;
  public constructor() {}
  public init() {
    // initialise to an empty-object, only override on
    // successful fetch.
    this.override = {};
    return from(
      fetch('assets/app-config.json')
        .then(function(response) {
          return response.json();
        })
        .catch(function(error) {
          return {};
        })
    )
      .pipe(
        map(config => {
          this.override = config;
          return config;
        })
      )
      .toPromise()
      .catch(); // This is an override for development, don't log
  }
  public get environment() {
    return { ...env, ...this.override };
  }
}
