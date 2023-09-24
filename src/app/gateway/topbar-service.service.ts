import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Network } from '../shared/networks';

@Injectable({
  providedIn: 'root'
})
export class TopbarService {

  private selectedAccountSub = new BehaviorSubject<string | null>(null)
  selectedAccount$ = this.selectedAccountSub.asObservable()

  private selectedNetworkSub = new BehaviorSubject<Network | null>(null)
  selectedNetwork$ = this.selectedNetworkSub.asObservable()

  constructor() { }

  setSelectedAccount(account: string) {
    this.selectedAccountSub.next(account)
  }

  getSelectedAccount() {
    return this.selectedAccountSub.value
  }

  setSelectedNetwork(network: Network) {
    this.selectedNetworkSub.next(network)
  }

  getSelectedNetwork() {
    return this.selectedNetworkSub.value
  }

}
