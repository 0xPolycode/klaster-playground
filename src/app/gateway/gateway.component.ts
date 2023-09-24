import { Component, EventEmitter, OnInit } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { BehaviorSubject, combineLatest, forkJoin, from, map, of, switchMap, tap } from 'rxjs';
import { BlockchainService } from '../shared/blockchain.service';
import { Network, networks } from '../shared/networks';
import { GatewayWalletProviderService } from './gateway-wallet-provider.service';
import { FadeIn } from '../shared/animations/fadeInOut.animation';
import { animate, style, transition, trigger } from '@angular/animations';
import { ethers } from 'ethers';
import { TopbarService } from './topbar-service.service';

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

  selectedNetwork$ = this.topbarService.selectedNetwork$
  connectedNetwork$ = this.blockchainService.network$

  isProcessingTxSub = new BehaviorSubject({ value: false })
  isProcessingTx$ = this.isProcessingTxSub.asObservable()

  txQueueVisibleSub = new BehaviorSubject(false)
  txQueueVisible$ = this.txQueueVisibleSub.asObservable()

  txRequestedInfoSub = new BehaviorSubject<TxRequestedInfo | null>(null)
  txRequestedInfo$ = this.txRequestedInfoSub.asObservable()


  constructor(private blockchainService: BlockchainService,
    private gatewayProviderService: GatewayWalletProviderService,
    private topbarService: TopbarService) { }

  ngOnInit(): void {
    this.gatewayProviderService.transactionRequested = this.txRequestedHandler
  }

  onEnter() {
    this.iframeSrcSub.next(this.urlBarForm.value)
  }

  clearIframe() {
    this.iframeSrcSub.next('')
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

    const network = this.topbarService.getSelectedNetwork()
    if(!network) { alert("Couldn't fetch network"); return }

    const value = info.tx.value ?
      ethers.BigNumber.from(info.tx.value) :
      ethers.BigNumber.from(0)

    const tx = await this.gatewayProviderService.callKlasterProxy(
      network.chainId,
      "0",
      info.tx.to,
      value,
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



  toggleTxQueueVisible() {
    this.txQueueVisibleSub.next(!this.txQueueVisibleSub.value)
  }



  logOut() {
    this.blockchainService.logOut()
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