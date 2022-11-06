import { TestBed } from '@angular/core/testing';
import { HttpClient, HttpHandler } from '@angular/common/http';

import { RbacService } from './rbac.service';

describe('RbacService', () => {
  beforeEach(() => TestBed.configureTestingModule({
    providers: [
      { provide: HttpClient },
      { provide: HttpHandler }
    ]
  }));

  it('should be created', () => {
    const service: RbacService = TestBed.inject(RbacService);
    expect(service).toBeTruthy();
  });
});
