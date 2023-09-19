import { EventEmitter, Injectable } from '@angular/core';
import { Core } from '@walletconnect/core'
import { BehaviorSubject, from, tap } from 'rxjs';
import { buildApprovedNamespaces } from '@walletconnect/utils'
import { SessionTypes } from '@walletconnect/types'
import { Web3Wallet } from '@walletconnect/web3wallet';
import { Web3Wallet as Web3WalletType } from '@walletconnect/web3wallet/dist/types/client';
import { networks } from '../shared/networks';
import { BlockchainService } from '../shared/blockchain.service';
import { ethers } from 'ethers';
const KlasterProxyFactoryABI = require('../../assets/abis/KlasterProxyFactoryABI.json')

@Injectable({
  providedIn: 'root'
})
export class GatewayWalletProviderService {

  core = new Core({
    projectId: 'c61e63a1cd49a3378488703f2afe71e0'
  })

  private web3WalletSub = new BehaviorSubject<Web3WalletType | null>(null)
  web3Wallet$ = this.web3WalletSub.asObservable().pipe(
    tap(_ => this.handleTxRequests())
  )

  private currentSessionSub = new BehaviorSubject<SessionTypes.Struct | undefined>(undefined)
  currentSession$ = this.currentSessionSub.asObservable()

  sessionRequest: any

  constructor(private blockchainService: BlockchainService) {
    Web3Wallet.init(
      {
        core: this.core,
        metadata: {
          name: 'Klaster Gateway',
          description: 'Klaster Multichain Wallet',
          url: 'https://localhost:4200',
          icons: []
        }
      }
    ).then(wallet => {
      this.web3WalletSub.next(wallet)
    })
  }

  transactionRequested?: (params: any) => void

  handleTxRequests() {

    this.sessionRequest = this.web3WalletSub.value!.on('session_request', async event => {

      const { topic, params, id } = event
      const { request } = params
      const requestParamsMessage = request.params[0]
    
      console.log("PARAMS: ", event)

      if(this.transactionRequested) { this.transactionRequested(event) }
    
    })
    
  }

  async pair(uri: string, address: string) {
    this.web3WalletSub.value?.on('session_proposal', async (proposal:any) => {

      const { id, params } = proposal

      const approvedNamespaces = buildApprovedNamespaces({
        proposal: params,
        supportedNamespaces: {
          eip155: {
            chains: networks.map(network => { return `eip155:${network.chainId}` }).concat(['eip155:1']),
            methods: ['eth_sendTransaction', 'personal_sign', 'eth_signTypedData'],
            events: ['accountsChanged', 'chainChanged'],
            accounts: networks.map(network => 
              { return `eip155:${network.chainId}:${address}` })
              .concat([`eip155:1:${address}`])
          }
        }
      })

      const session = await this.web3WalletSub.value?.approveSession({
        id: proposal.id,
        namespaces: approvedNamespaces
      })
      this.currentSessionSub.next(session)
    })

    return await this.web3WalletSub.value?.pair({ uri: uri })
  }

  async calculateWalletAddress(salt: string = ''): Promise<string> {
    const klasterProxyFactory = new ethers.Contract(
      '0xe31eb0adfD645a2Fe39e3732683791738151AE11',
      KlasterProxyFactoryABI,
      this.blockchainService.provider
    )
    return await klasterProxyFactory['calculateAddress'](
      this.blockchainService.getAccount(),
      salt
    )
  }

  async switchChain(chainID: number) {
    const topic = this.currentSessionSub.value?.topic
    if(topic !== undefined) {
      return this.web3WalletSub.value?.emitSessionEvent({
        topic: topic,
        chainId: `eip155:${chainID}`,
        event: {
          name: 'chainChanged',
          data: chainID
        },
      })
    }
  }

  async switchAccount(account: string) {
    const topic = this.currentSessionSub.value?.topic
    if(topic !== undefined) {
      return this.web3WalletSub.value?.emitSessionEvent({
        topic: topic,
        chainId: `eip155:${this.blockchainService.getNetwork()?.chainId}`,
        event: {
          name: 'accountsChanged',
          data: [account]
        },
      })
    }
  }
}
