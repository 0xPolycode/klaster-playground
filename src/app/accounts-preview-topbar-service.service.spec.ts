import { TestBed } from '@angular/core/testing';

import { AccountsPreviewTopbarServiceService } from './accounts-preview-topbar-service.service';

describe('AccountsPreviewTopbarServiceService', () => {
  let service: AccountsPreviewTopbarServiceService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AccountsPreviewTopbarServiceService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
