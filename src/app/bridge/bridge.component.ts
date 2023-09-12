import { Component, OnInit } from '@angular/core';
import { PolycodeService } from '../shared/polycode.service';
import { BehaviorSubject, combineLatest, from, map, switchMap, take } from 'rxjs';
import { networks } from '../shared/networks';
import { FormControl, Validators } from '@angular/forms';
import { BlockchainService } from '../shared/blockchain.service';
import { BridgeService } from './bridge.service';

@Component({
  selector: 'app-bridge',
  templateUrl: './bridge.component.html',
  styleUrls: ['./bridge.component.css']
})
export class BridgeComponent implements OnInit {

  itemsSub = new BehaviorSubject<{name: string, balance: number, symbol: string, address: string}[]>([])

  selectedDestinationSub = new BehaviorSubject("Optimsim Goerli")
  selectedDestination$ = this.selectedDestinationSub.asObservable()

  selectNetworkModalVisibleSub = new BehaviorSubject(false)
  selectNetworkModalVisible$ = this.selectNetworkModalVisibleSub.asObservable()

  selectedTokenIndexSub = new BehaviorSubject(1)
  selectedTokenIndex$ = this.selectedTokenIndexSub.asObservable()

  selectedNetworkChainIdSub = new BehaviorSubject(networks[0].chainId)
  selectedNetworkChainId$ = this.selectedNetworkChainIdSub.asObservable()

  tokenSelectModalVisibleSub = new BehaviorSubject(false)
  tokenSelectModalVisible$ = this.tokenSelectModalVisibleSub.asObservable()

  tokenBridgedHashSub = new BehaviorSubject("")
  tokenBridgedHash$ = this.tokenBridgedHashSub.asObservable()

  bridgeProcessingSub = new BehaviorSubject(false)
  bridgeProcessing$ = this.bridgeProcessingSub.asObservable()

  networks = networks.filter(x => x.name !== 'Ethereum Sepolia')

  tokenAmountFormControl = new FormControl("", [Validators.required])

  network$ = this.blockchainService.network$

  chains = networks


  tokens$ = from(this.bridgeService.getMyTokens()).pipe(
    map(tokens => {
      return tokens.map((token: string[]) => {
        return {
          address: token[0],
          name: token[1],
          symbol: token[2],
          decimals: token[3],
          supply: token[4]
        }
      })
    })
  )

  balance$ = combineLatest([
    this.tokens$, this.selectedTokenIndex$
  ]).pipe(
    switchMap(([tokens, index]) => {
      const token = tokens[index]
      return from(this.bridgeService.getBalance(token.address))
    })
  )


  constructor(private pc: PolycodeService, 
    private blockchainService: BlockchainService,
    private bridgeService: BridgeService) { }

  toggleNetworkSelectModal() {
    this.selectNetworkModalVisibleSub.next(!this.selectNetworkModalVisibleSub.value)
  }

  selectToken(index: number) {
    this.selectedTokenIndexSub.next(index + 1)
    this.tokenSelectModalVisibleSub.next(false)
  }

  selectNetwork(chainId: number) {
    this.selectedNetworkChainIdSub.next(chainId)
    this.selectNetworkModalVisibleSub.next(false)
  }

  getNetworkByChainId(chainId: number) {
    return networks.filter(x => {
      return x.chainId === chainId
    }).at(0)
  }

  toggleTokenSelectModal() {
    this.tokenSelectModalVisibleSub.next(!this.tokenSelectModalVisibleSub.value)
  }

  setMaxValue() {
    this.balance$.pipe(take(1)).subscribe(balance => {
      this.tokenAmountFormControl.setValue(balance)
    })
  }

  bridgeToken() {

    this.bridgeProcessingSub.next(true)

    const token = this.itemsSub.value[this.selectedTokenIndexSub.value - 1].address
    const network = this.networks.filter(network => network.chainId === this.selectedNetworkChainIdSub.value).at(0)!.chainId
    const amount = this.tokenAmountFormControl.value

    this.pc.bridgeToken(token, network, parseInt(amount!)).then(res => {
      this.tokenBridgedHashSub.next(res.transactionHash ?? "")
      this.bridgeProcessingSub.next(false)
    })
  }

  ngOnInit(): void {

    
  }

}
