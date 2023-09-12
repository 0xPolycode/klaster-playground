import { Component, EventEmitter, OnInit } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { BehaviorSubject } from 'rxjs';
import { BlockchainService } from '../shared/blockchain.service';
import { Network, networks } from '../shared/networks';

@Component({
  selector: 'app-gateway',
  templateUrl: './gateway.component.html',
  styleUrls: ['./gateway.component.css']
})
export class GatewayComponent implements OnInit {

  iframeSrcSub = new BehaviorSubject("")
  iframeSrc$ = this.iframeSrcSub.asObservable()

  urlBarForm = new FormControl("", [Validators.required])

  address$ = this.blockchainService.account$

  chains = networks

  selectedChainSub = new BehaviorSubject(this.chains[0])
  selectedChain$ = this.selectedChainSub.asObservable()

  chainSelectorVisibleSub = new BehaviorSubject(false)
  chainSelectorVisible$ = this.chainSelectorVisibleSub.asObservable()

  proxy: any

  constructor(private blockchainService: BlockchainService) { }

  ngOnInit(): void {
    this.initProviderProxyIntercept()
    console.log((window as any).ethereum)
  }

  setIframeSrc(url?: string) {
    if(url) {
      this.iframeSrcSub.next(url)
      this.urlBarForm.setValue(url)
    } else {
      this.iframeSrcSub.next(this.urlBarForm.value!)
    }
  }

  setChain(chain: Network) {
    this.dispatchEvent(chain)
    this.selectedChainSub.next(chain)
    this.toggleChainSelector()
  }

  dispatchEvent(chain: Network) {

    (this.blockchainService.provider.provider as any).emit('network', [this.selectedChainSub.value.chainId, chain.chainId])    
  }

  toggleChainSelector() {
    this.chainSelectorVisibleSub.next(!this.chainSelectorVisibleSub.value)
  }

  logOut() {
    this.blockchainService.logOut()
  }

  handler = {
    get(target: any, prop: any, receiver: any) {
      if(['request'].includes(prop)) {
        return Reflect.get(target, prop, receiver)
      }
      return async (...args: any) => {
        const arg0IsMethodString = typeof args[0] === 'string';
        const method = arg0IsMethodString ? args[0] : args[0].method;
        const params = arg0IsMethodString ? args[1] : args[0].params;

        const result = await Reflect.get(target, prop, receiver)(...args);

        if(method === 'eth_requestAccounts') {
          console.log("CAUGHT_ACCOUNTS")
        }

        return result
      }
    }
  }

  initProviderProxyIntercept() {
    var that = this
    Object.defineProperty(window, 'ethereum', {
      get() {
        this.proxy = new Proxy(that.blockchainService.provider, that.handler)
      },
    })
  }

}
