import { Injectable } from '@angular/core';
import { Core } from '@walletconnect/core'
import { Web3Wallet } from '@walletconnect/web3wallet';
import { from } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class GatewayWalletProviderService {

  core = new Core({
    projectId: 'c61e63a1cd49a3378488703f2afe71e0'
  })

  web3Wallet$ = from(Web3Wallet.init({
    core: this.core,
    metadata: {
      name: 'Klaster Gateway',
      description: 'Klaster Multichain Wallet',
      url: 'https://app.klaster.io',
      icons: []
    }
  }))

  constructor() { }
}
