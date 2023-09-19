import { Component, EventEmitter, OnInit } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { BehaviorSubject, combineLatest, forkJoin, from, map, of, switchMap, tap } from 'rxjs';
import { BlockchainService } from '../shared/blockchain.service';
import { Network, networks } from '../shared/networks';
import { GatewayWalletProviderService } from './gateway-wallet-provider.service';

@Component({
  selector: 'app-gateway',
  templateUrl: './gateway.component.html',
  styleUrls: ['./gateway.component.css']
})
export class GatewayComponent implements OnInit {

  iframeSrcSub = new BehaviorSubject<string | null>(null)
  iframeSrc$ = this.iframeSrcSub.asObservable()

  urlBarForm = new FormControl("", [Validators.required])

  address$ = this.blockchainService.account$

  chains = networks

  selectedChainSub = new BehaviorSubject(this.chains[0])
  selectedChain$ = this.selectedChainSub.asObservable()

  chainSelectorVisibleSub = new BehaviorSubject(false)
  chainSelectorVisible$ = this.chainSelectorVisibleSub.asObservable()

  injectWeb3ProviderVisibleSub = new BehaviorSubject(false)
  injectWeb3ProviderVisible$ = this.injectWeb3ProviderVisibleSub.asObservable()

  walletConnectURIForm = new FormControl('', [])

  currentSession$ = this.gatewayProviderService.currentSession$

  addressSelectorVisibleSub = new BehaviorSubject(false)
  addressSelectorVisible$ = this.addressSelectorVisibleSub.asObservable()

  connectedNetwork$ = this.blockchainService.network$

  contractWalletAddresses$ =  of([1,2,3,4,5,6]).pipe(
    switchMap(nums => {
      return combineLatest(
        nums.map(num => { return from(this.gatewayProviderService.calculateWalletAddress(num.toString())) }) 
      )
    }),
    tap(addresses => {
      this.selectedWalletAddressSub.next(addresses[0])
    })
  )

  selectedWalletAddressSub = new BehaviorSubject('')
  selectedWalletAddress$ = this.selectedWalletAddressSub.asObservable()


  constructor(private blockchainService: BlockchainService,
    private gatewayProviderService: GatewayWalletProviderService) { }

  ngOnInit(): void {
    this.walletConnectURIForm.valueChanges.subscribe(value => {
      if(value?.startsWith('wc')) {
        this.pairWalletConnect()
      }
    })

    this.gatewayProviderService.transactionRequested = (params) => {
      alert(params)
    }
  }

  setIframeSrc(url?: string) {
    if(url) {
      this.iframeSrcSub.next(url)
      this.urlBarForm.setValue(url)
    } else {
      this.iframeSrcSub.next(this.urlBarForm.value!)
    }
  }

  toggleAddressSelectorVisible() {
    this.addressSelectorVisibleSub.next(!this.addressSelectorVisibleSub.value)
  }

  setChain(chain: Network) {
    this.dispatchEvent(chain)
    this.selectedChainSub.next(chain)
    this.gatewayProviderService.switchChain(chain.chainId).then(_ => {
    })
    this.toggleChainSelector()
  }

  setSelectedWalletAddress(address: string) {
    this.selectedWalletAddressSub.next(address)
    this.gatewayProviderService.switchAccount(address)
    this.toggleAddressSelectorVisible()
  }

  dispatchEvent(chain: Network) {
    (this.blockchainService.provider?.provider as any)
      .emit('network', 
        [this.selectedChainSub.value.chainId, chain.chainId])    
  }

  toggleChainSelector() {
    this.chainSelectorVisibleSub.next(!this.chainSelectorVisibleSub.value)
  }

  toggleInjectURI() {
    this.injectWeb3ProviderVisibleSub.next(!this.injectWeb3ProviderVisibleSub.value)
  }

  logOut() {
    this.blockchainService.logOut()
  }

  async pairWalletConnect() {
    this.gatewayProviderService.pair(this.walletConnectURIForm.value!, this.selectedWalletAddressSub.value).then(res => {
      this.toggleInjectURI()
    })
  }

  async switchChain(chainID: number) {
  }

}
