import { Component, OnInit } from '@angular/core';
import { BehaviorSubject, tap } from 'rxjs';
import { TopbarService } from '../topbar-service.service';
import { Network, networks } from 'src/app/shared/networks';
import { GatewayWalletProviderService } from '../gateway-wallet-provider.service';
import { FormControl } from '@angular/forms';

@Component({
  selector: 'app-network-selector-topbar-module',
  templateUrl: './network-selector-topbar-module.component.html',
  styleUrls: ['./network-selector-topbar-module.component.css']
})
export class NetworkSelectorTopbarModuleComponent implements OnInit {

  currentSession$ = this.gatewayProviderService.currentSession$
  selectedNetwork$ = this.topbarService.selectedNetwork$

  networkSelectorVisibleSub = new BehaviorSubject(false)
  networkSelectorVisible$ = this.networkSelectorVisibleSub.asObservable()

  walletConnectURIForm = new FormControl('', [])

  injectWeb3ProviderVisibleSub = new BehaviorSubject(false)
  injectWeb3ProviderVisible$ = this.injectWeb3ProviderVisibleSub.asObservable()


  constructor(private topbarService: TopbarService,
    private gatewayProviderService: GatewayWalletProviderService) {}

  ngOnInit(): void {
    this.walletConnectURIForm.valueChanges.subscribe(value => {
      if(value?.startsWith('wc')) {
        this.pairWalletConnect()
      }
    })
    this.topbarService.setSelectedNetwork(networks[0])
  }

  availableNetworks = networks

  toggleChainSelector() {
    this.networkSelectorVisibleSub.next(!this.networkSelectorVisibleSub.value)
  }

  setNetwork(network: Network) {
    this.topbarService.setSelectedNetwork(network)
    this.gatewayProviderService.switchChain(network.chainId).then(_ => {
    })
    this.toggleChainSelector()
  }

  async pairWalletConnect() {

    const msg = "Invalid wallet connect URI"
    const value = this.walletConnectURIForm.value
    if(!value) { alert(msg); return }
    if(!value.startsWith('wc:')) { alert(msg); return }
    
    const selectedAccount = this.topbarService.getSelectedAccount()
    if(!selectedAccount) { 
      alert("No account selected")
      return
    }

    this.gatewayProviderService.pair(value, selectedAccount).then(res => {
      this.toggleInjectURI()
    })
  }

  toggleInjectURI() {
    this.injectWeb3ProviderVisibleSub.next(!this.injectWeb3ProviderVisibleSub.value)
  }

  async disconnect(){
    this.walletConnectURIForm.setValue('')
    this.gatewayProviderService.disconnectAccount()
  }

}
