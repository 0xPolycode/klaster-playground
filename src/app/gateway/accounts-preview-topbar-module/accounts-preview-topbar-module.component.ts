import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { BehaviorSubject, Observable, combineLatest, from, map, of, switchMap, tap } from 'rxjs';
import { GatewayWalletProviderService } from '../gateway-wallet-provider.service';
import { TopbarService } from '../topbar-service.service';

@Component({
  selector: 'app-accounts-preview-topbar-module',
  templateUrl: './accounts-preview-topbar-module.component.html',
  styleUrls: ['./accounts-preview-topbar-module.component.css']
})
export class AccountsPreviewTopbarModuleComponent implements OnInit {

  constructor(private gatewayProviderService: GatewayWalletProviderService,
    private topbarService: TopbarService) { }

  selectedWalletAddress$ = this.topbarService.selectedAccount$

  addressSelectorVisibleSub = new BehaviorSubject(false)
  addressSelectorVisible$ = this.addressSelectorVisibleSub.asObservable()

  @Output() selectedWalletChanged = new EventEmitter<string>()

  contractWalletAddresses$!: Observable<string[]>

  ngOnInit(): void {
    this.contractWalletAddresses$ = of([0,1,2,3,4,5,6]).pipe(
      switchMap(nums => {
        return combineLatest(
          nums.map(num => { return from(this.gatewayProviderService.calculateWalletAddress(num.toString())) }) 
        )
      }),
      tap(addresses => {
        this.topbarService.setSelectedAccount(addresses[0])
      })
    )
  }

  setSelectedWalletAddress(address: string) {
    this.topbarService.setSelectedAccount(address)
    this.gatewayProviderService.switchAccount(address)
    this.toggleAddressSelectorVisible()
  }

  toggleAddressSelectorVisible() {
    this.addressSelectorVisibleSub.next(!this.addressSelectorVisibleSub.value)
  }

}
