import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Router } from '@angular/router';

import * as shortuuid from 'short-uuid';

import { RbacService } from './rbac.service';

import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
  HttpErrorResponse
} from '@angular/common/http';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  constructor(private router: Router, private rbacService: RbacService) { }

  intercept(
    request: HttpRequest<any>,
    next: HttpHandler
  ): Observable<HttpEvent<any>> {
    // Do not add auth header to the auth system itself
    const re = /https:\/\/auth./gi;
    if (request.url.search(re) === 0 || !this.rbacService.rbac) {
      return next.handle(request).pipe(
        tap(
          () => {},
          (err: any) => {
            if (err instanceof HttpErrorResponse) {
              if (err.status === 401 || err.status === 403) {
                alert('No permission: not signed in');
                this.router.navigate(['']);
              }
            }
          }
        )
      );
    }

    const requestId = shortuuid.generate();
    const creq = request.clone({
      setHeaders: {
        Authorization: `Bearer ${this.rbacService.rbac.token}`,
        'X-Request-ID': requestId
      }
    });
    return next.handle(creq).pipe(
      tap(
        () => { },
        (err: any) => {
          if (err instanceof HttpErrorResponse) {
            if (err.status === 401 || err.status === 403) {
              alert('No permission for action');
              this.router.navigate(['']);
            }
          }
        }
      )
    );
  }
}
