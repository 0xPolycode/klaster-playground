import { Component, OnInit } from '@angular/core';
import { PolycodeService } from '../shared/polycode.service';
import { BlockchainService } from '../shared/blockchain.service';
import { BehaviorSubject, map, take } from 'rxjs';
import { networks } from '../shared/networks';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent implements OnInit {

  address$ = this.blockchainService.account$
  network$ = this.blockchainService.network$

  networkSelectorOpenSub = new BehaviorSubject(false)
  networkSelectorOpen$ = this.networkSelectorOpenSub.asObservable()

  supportedNetworks = networks

  constructor(private blockchainService: BlockchainService) { }

  ngOnInit(): void {
  }

  toggleNetworkSelector() {
    this.networkSelectorOpenSub.next(!this.networkSelectorOpenSub.value)
  }

  logOut() {
    this.blockchainService.logOut()
  }

  changeNetwork(chainId: number) {
    this.networkSelectorOpenSub.next(false)
    this.blockchainService.changeNetwork(chainId)
  }

}
