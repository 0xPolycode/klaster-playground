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
import { TxRequestedInfo } from './gateway.component';
import { KLASTER_PROXY_ADDRESS } from '../shared/contract-addresses';
const KlasterProxyFactoryABI = require('../../assets/abis/KlasterProxyFactoryABI.json')

@Injectable({
  providedIn: 'root'
})
export class GatewayWalletProviderService {

  private SESSION_STORE_KEY = 'io.klaster.session-storage-key'

  core = new Core({
    projectId: 'c61e63a1cd49a3378488703f2afe71e0'
  })

  private web3WalletSub = new BehaviorSubject<Web3WalletType | null>(null)
  web3Wallet$ = this.web3WalletSub.asObservable()

  private currentSessionSub = new BehaviorSubject<SessionTypes.Struct | undefined>(undefined)
  currentSession$ = this.currentSessionSub.asObservable().pipe(
    tap(session => {
      localStorage.setItem(this.SESSION_STORE_KEY, JSON.stringify(session))
    })
  )

  sessionRequest: any

  constructor(private blockchainService: BlockchainService) {
    Web3Wallet.init(
      {
        core: this.core,
        metadata: {
          name: 'Klaster Gateway',
          description: 'Klaster Multichain Wallet',
          url: 'http://localhost:4200',
          icons: []
        }
      }
    ).then(wallet => {
      this.web3WalletSub.next(wallet)
      this.handleTxRequests()
    })
    const storedSession = localStorage.getItem(this.SESSION_STORE_KEY)
    if((storedSession != "undefined") && (storedSession != null)) {
      const session = JSON.parse(storedSession) as SessionTypes.Struct
      this.currentSessionSub.next(session)
    }
  }

  transactionRequested?: (params: TxRequestedInfo) => void

  handleTxRequests() {

    this.web3WalletSub.value?.on('session_request', async event => {

      const { topic, params, id } = event
      const { request } = params
      const requestParamsMessage = request.params[0]
    

      if(this.transactionRequested) { 
        this.transactionRequested({
          tx: requestParamsMessage,
          wcData: {
            id: id,
            topic: topic
          }
        }) 
      }
    
    })
  }

  getWeb3Wallet() {
    return this.web3WalletSub.value
  }

  async callKlasterProxy(chainId: number, salt: string, destAddress: string, value: ethers.BigNumber, data: string, gasLimit: string) {
    const klasterProxy = this.getKlasterProxy()

    const fee = await klasterProxy['calculateFee'](
      this.blockchainService.getAccount(),
      chainId,
      salt,
      destAddress,
      value,
      data,
      gasLimit
    )

    return await klasterProxy['execute'](
      chainId,
      salt,
      destAddress,
      value,
      data,
      gasLimit,
      {
        value: fee
      }
    )
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

  private getKlasterProxy() {
    return new ethers.Contract(
      KLASTER_PROXY_ADDRESS,
      KlasterProxyFactoryABI,
      this.blockchainService.provider?.getSigner()
    )
  }

  async calculateWalletAddress(salt: string = ''): Promise<string> {
    
    const klasterProxyFactory = this.getKlasterProxy()

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

  async disconnectAccount() {
    const topic = this.currentSessionSub.value!.topic
    this.currentSessionSub.next(undefined)

    await this.web3WalletSub.value?.disconnectSession({
      topic: topic,
      reason: {
        code: 6000,
        message: 'User disconnected.',
      }
    })
  }
}
