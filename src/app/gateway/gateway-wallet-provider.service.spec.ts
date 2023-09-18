import { TestBed } from '@angular/core/testing';

import { GatewayWalletProviderService } from './gateway-wallet-provider.service';

describe('GatewayWalletProviderService', () => {
  let service: GatewayWalletProviderService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(GatewayWalletProviderService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
