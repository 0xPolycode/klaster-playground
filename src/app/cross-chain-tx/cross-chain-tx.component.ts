import { Component, OnInit } from '@angular/core';
import { BehaviorSubject, combineLatest, debounceTime, distinctUntilChanged, from, map, of, switchMap, take, tap } from 'rxjs';
import { Network, networks } from '../shared/networks';
import { PolycodeService } from '../shared/polycode.service';
import { FormControl } from '@angular/forms';
import { arrayify } from 'ethers/lib/utils';
import { BlockchainService } from '../shared/blockchain.service';
import { SwapService } from './swap.service';
import { ethers } from 'ethers';

@Component({
  selector: 'app-cross-chain-tx',
  templateUrl: './cross-chain-tx.component.html',
  styleUrls: ['./cross-chain-tx.component.css']
})
export class CrossChainTxComponent implements OnInit {


  amountSend = new FormControl('')
  amountReceive = new FormControl('')

  sendWarning$ = combineLatest([
    this.amountSend.valueChanges,
    from(this.swapService.getTokenBalance("0x114CF2089c88D64Ae9c3FDc90E8fD568E79B9681"))
  ]).pipe(
    map(([inputValue, balance]) => {
      if(inputValue) {
        const inputN = ethers.BigNumber.from(inputValue)
        if(inputN.gt(balance)) {
          return `Maximum send exceeded. Your balance is: ${balance}`
        } else {
          return null
        }
      } else {
        return null
      }
    })
  )

  txHashSub = new BehaviorSubject<string | null>(null)
  txHash$ = this.txHashSub.asObservable()

  receiveAmount$ = this.amountSend.valueChanges.pipe(
    debounceTime(300),
    switchMap(value => {
      if(!value) {
        return of(null)
      }
      return from(this.swapService.calculateReceiveUniswap(
        this.selectedChainSub.value.chainId,
        parseInt(value),
      ))
    })
  )

  isButtonLoadingSub = new BehaviorSubject(false)
  isButtonLoading$ = this.isButtonLoadingSub.asObservable()

  isButtonDisabled$ = this.amountSend.valueChanges.pipe(
    map(value => {
      return false
    })
  )

  chains = networks.filter(network => network.chainId !== 43113)

  selectedChainSub = new BehaviorSubject<Network>(networks[1])
  selectedChain$ = this.selectedChainSub.asObservable()

  selectChainVisibleSub = new BehaviorSubject(false)
  selectChainVisible$ = this.selectChainVisibleSub.asObservable()

  hashSub = new BehaviorSubject<string | undefined>("")
  hash$ = this.hashSub.asObservable()

  network$ = this.blockchainService.network$

  tokenBalanceSub = new BehaviorSubject<{ balance: number }>({ balance: -1})
  tokenBalance$ = this.tokenBalanceSub.asObservable().pipe(
    take(2)
  )

  balanceMessage$ = this.tokenBalance$.pipe(
    map(balance => balance.balance === -1 ? "_" : balance.balance.toString())
  )

  swapTxHashSub = new BehaviorSubject<string | null>(null)
  swapTxHash$ = this.swapTxHashSub.asObservable()

  constructor(private blockchainService: BlockchainService, private swapService: SwapService) { }

  ngOnInit(): void {
    this.swapService.getTokenBalance("0x114CF2089c88D64Ae9c3FDc90E8fD568E79B9681").then((balance: ethers.BigNumber) => {
      console.log(balance.toNumber())
      this.tokenBalanceSub.next({balance: balance.toNumber()})
    })

    this.swapService.calculateReceiveUniswap(420, 55).then(res => {
      console.log("REEES", res.toString())
    })
  }

  performCrossChainSwap() {
    this.isButtonLoadingSub.next(true)
    this.swapService.swapTokens("0x114CF2089c88D64Ae9c3FDc90E8fD568E79B9681", 
    this.selectedChainSub.getValue().chainId,
    parseInt(this.amountSend.value!)).then(result => {
      this.swapTxHashSub.next(result.hash)
      this.isButtonLoadingSub.next(false)
    }).catch(err => {
      alert(err)
      this.isButtonLoadingSub.next(false)
    })
  }

  mintTokenA() {
    this.swapService.mintToken(
      "0x114CF2089c88D64Ae9c3FDc90E8fD568E79B9681"
    ).then(() => {
      alert("Success")
    })
  }

  toggleSelectChainVisibility() {
    this.selectChainVisibleSub.next(!this.selectChainVisibleSub.value)
  }

  selectChain(index: number) {
    this.selectedChainSub.next(this.chains[index])
    this.toggleSelectChainVisibility()
  }

}