import { TestBed } from '@angular/core/testing';

import { ProcessingTxModalService } from './processing-tx-modal.service';

describe('ProcessingTxModalService', () => {
  let service: ProcessingTxModalService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ProcessingTxModalService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
