import { TestBed } from '@angular/core/testing';

import { TopbarService } from './topbar-service.service';

describe('TopbarServiceService', () => {
  let service: TopbarService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TopbarService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
