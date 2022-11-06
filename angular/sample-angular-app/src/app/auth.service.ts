import { AuthConfig } from 'angular-oauth2-oidc';
import { DynamicEnvironmentService } from './dynamic-environment.init';
import { Injectable } from '@angular/core';

const env = new DynamicEnvironmentService();

function baseHost(_env): string {
  if (_env['overrideDomain']) {
    return _env['overrideDomain'];
  }

  const hostname = window.location.hostname;
  const firstPeriod = hostname.indexOf('.');
  return hostname.substring(firstPeriod + 1);
}

function authHost(_env): string {
    return 'auth.' + baseHost(_env);
}

export const authConfig: AuthConfig = {
  issuer: '',
  redirectUri: window.location.origin + '/',
  clientId: '',
  scope: 'openid profile email federated:id',
};

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  constructor(private dynamic_env: DynamicEnvironmentService) {
    authConfig.issuer = 'https://' + authHost(env.environment) + '/';
    authConfig.clientId = baseHost(env.environment);
  }

  get authConfig() {
    return authConfig;
  }
}
