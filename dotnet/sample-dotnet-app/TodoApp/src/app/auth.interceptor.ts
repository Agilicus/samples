import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

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
  constructor(private rbacService: RbacService) { }

  intercept(
    request: HttpRequest<any>,
    next: HttpHandler
  ): Observable<HttpEvent<any>> {
    // Do not add auth header to the auth system itself
    const re = /https:\/\/auth./gi;
    if (request.url.search(re) !== 0 && this.rbacService.rbac) {
      const requestId = shortuuid.generate();
      request = request.clone({
        setHeaders: {
          Authorization: `Bearer ${this.rbacService.rbac.token}`,
          'X-Request-ID': requestId
        }
      });
    }

    return next.handle(request).pipe(
      tap(
        () => { },
        (err: any) => {
          if (err instanceof HttpErrorResponse) {
            if (err.status === 401 || err.status === 403) {
              alert("No permission for action");
              // this.router.navigate(['']);
            }
          }
        }
      )
    );
  }
}
