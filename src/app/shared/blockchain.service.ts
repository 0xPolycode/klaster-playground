import { Injectable } from '@angular/core';
import { ethers } from 'ethers';
import { BehaviorSubject, tap } from 'rxjs';
import { Network, getNetworkFromChainID, networks } from './networks';
import { hexlify } from 'ethers/lib/utils';

@Injectable({
  providedIn: 'root'
})
export class BlockchainService {

  private WALLET_KEY = 'klaster.storage.wallet-key'

  private provider = new ethers.providers.Web3Provider((window as any).ethereum, "any")

  readProviders = networks.map(network => {
    return { 
      chainId: network.chainId, 
      provider: new ethers.providers.JsonRpcProvider(network.rpcUrls[0]) }
  })

  private accountSub = new BehaviorSubject<string | undefined>(undefined)
  account$ = this.accountSub.asObservable().pipe(
    tap(account => localStorage.setItem(this.WALLET_KEY, account ?? ""))
  )

  private networkSub = new BehaviorSubject<Network | undefined>(undefined)
  network$ = this.networkSub.asObservable()

  constructor() { 
    const wallet = localStorage.getItem(this.WALLET_KEY)
    if(wallet) {
      this.accountSub.next(wallet)
    }
    this.provider.getNetwork().then(network => this.networkSub.next(getNetworkFromChainID(network.chainId)))

    this.handleNetworkReload()
  }

  handleNetworkReload(){
    const provider = new ethers.providers.Web3Provider((window as any).ethereum, "any");
    provider.on("network", (newNetwork, oldNetwork) => {
        if (oldNetwork) {
            window.location.reload();
        }
    });
  }

  auth() {
    this.provider.send('eth_requestAccounts', [])
      .then(res => { this.accountSub.next(res[0]) })
      
    this.provider.getNetwork()
      .then(network => { this.networkSub.next(getNetworkFromChainID(network.chainId)) })
  }

  changeNetwork(chainID: number) {

    const newChain = getNetworkFromChainID(chainID)!
    console.log(ethers.utils.hexValue(newChain.chainId))
    const newChainFormatted = {
          chainId: ethers.utils.hexValue(newChain.chainId),
          rpcUrls: newChain.rpcUrls,
          chainName: newChain.name,
          nativeCurrency: {
              name: newChain.nativeCurrency.name,
              symbol: newChain.nativeCurrency.symbol,
              decimals: newChain.nativeCurrency.decimals
          },
          blockExplorerUrls: newChain.blockExploreUrls
      }

    this.provider.send('wallet_addEthereumChain', [
      newChainFormatted
    ]).then(_ => {
      location.reload()
    })
  }


  logOut() {
    this.accountSub.next(undefined)
  }
  
}
