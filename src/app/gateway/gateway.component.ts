import { Component, EventEmitter, OnInit } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { BehaviorSubject, combineLatest, forkJoin, from, map, of, switchMap, tap } from 'rxjs';
import { BlockchainService } from '../shared/blockchain.service';
import { Network, networks } from '../shared/networks';
import { GatewayWalletProviderService } from './gateway-wallet-provider.service';
import { FadeIn } from '../shared/animations/fadeInOut.animation';
import { animate, style, transition, trigger } from '@angular/animations';
import { ethers } from 'ethers';

@Component({
  selector: 'app-gateway',
  templateUrl: './gateway.component.html',
  styleUrls: ['./gateway.component.css'],
  animations: [
    trigger('slideInLeft', [
      transition(':enter', [
        style({
          transform: 'translateX(100%)'
        }),
        animate('0.3s ease-in', style({
          transform: 'translateX(0%)'
        }))
      ]),
      transition(':leave', [
        style({
          opacity: 1,
          transform: 'translateX(0)'
        }),
        animate('0.3s ease-out', style({
          opacity: 1,
          transform: 'translateX(100%)'
        }))
      ])
    ]),
    trigger('fadeInOut', [
      transition(':enter', [
        style({
          opacity: 0
        }),
        animate('0.05s ease-in', style({
          opacity: 1
        }))
      ]),
      transition(':leave', [
        style({
          opacity: 1
        }),
        animate('0.05s ease-out', style({
          opacity: 0
        }))
      ])
    ])
  ]
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

  isProcessingTxSub = new BehaviorSubject({ value: false })
  isProcessingTx$ = this.isProcessingTxSub.asObservable()


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

  txRequestedInfoSub = new BehaviorSubject<TxRequestedInfo | null>(null)
  txRequestedInfo$ = this.txRequestedInfoSub.asObservable()

  constructor(private blockchainService: BlockchainService,
    private gatewayProviderService: GatewayWalletProviderService) { }

  ngOnInit(): void {
    this.walletConnectURIForm.valueChanges.subscribe(value => {
      if(value?.startsWith('wc')) {
        this.pairWalletConnect()
      }
    })
    this.gatewayProviderService.transactionRequested = this.txRequestedHandler

  }

  onEnter() {
    this.iframeSrcSub.next(this.urlBarForm.value)
  }

  txRequestedHandler = async (params: TxRequestedInfo) => {
    this.txRequestedInfoSub.next(params)
  }

  async declineTransaction(info: TxRequestedInfo) {
    setTimeout(() => { this.txRequestedInfoSub.next(null) }, 100)
    await this.gatewayProviderService.getWeb3Wallet()?.respondSessionRequest({
      topic: info.wcData.topic,
      response: {
        id: info.wcData.id,
        jsonrpc: '2.0',
        error: {
          code: 5000,
          message: 'User rejected'
        }
      }
    })
  }

  async acceptTransaction(info: TxRequestedInfo) {
    this.isProcessingTxSub.next({ value: true })

    const tx = await this.gatewayProviderService.callKlasterProxy(
      this.selectedChainSub.value.chainId,
      "0",
      info.tx.to,
      ethers.BigNumber.from(info.tx.value),
      info.tx.data,
      info.tx.gas
    )
    this.isProcessingTxSub.next({ value: false })


    await this.gatewayProviderService.getWeb3Wallet()?.respondSessionRequest({
      topic: info.wcData.topic,
      response: {
        id: info.wcData.id,
        jsonrpc: '2.0',
        result: tx
      }
    })

    this.txRequestedInfoSub.next(null)

    const reciept = await tx.wait()
    
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
  
  async disconnect(){
    this.walletConnectURIForm.setValue('')
    this.gatewayProviderService.disconnectAccount()
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

export interface TxRequestedInfo {
  tx: {
    from: string,
    to: string,
    data: string,
    value: string,
    nonce: string,
    gasPrice: string,
    gas: string
  }
  wcData: {
    topic: any
    id: any
  }
}