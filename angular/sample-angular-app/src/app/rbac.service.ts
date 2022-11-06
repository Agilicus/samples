import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { HttpHeaders } from '@angular/common/http';
import { RbacInfo } from './rbac.model';
import { AuthService } from './auth.service';

import { Observable } from 'rxjs';

import { tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class RbacService {
  rbac: RbacInfo;
  constructor(private http: HttpClient,
              private authService: AuthService) {
    const rb = localStorage.getItem('rbac');
    if (rb) {
        this.rbac = JSON.parse(rb);
    }
   }
  logout() {
    this.rbac = null;
    localStorage.removeItem('rbac');
  }
  getRbac(id_token: string): Observable<RbacInfo> {
    const msg = { 'id_token': id_token };
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
      })
    };
    const url = this.authService.authConfig.issuer + 'v1/whoami';
    return this.http.post(url,
      msg,
      httpOptions).pipe(
        tap(
            _rbac => {
              this.rbac = _rbac;
              localStorage.setItem('rbac', JSON.stringify(this.rbac));
            }
        )
      );
  }
}
