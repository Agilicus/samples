import { TestBed } from '@angular/core/testing';

import { RbacService } from './rbac.service';

describe('RbacService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: RbacService = TestBed.get(RbacService);
    expect(service).toBeTruthy();
  });
});
