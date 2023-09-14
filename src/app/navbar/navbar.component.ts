import { Component, OnInit } from '@angular/core';
import { PolycodeService } from '../shared/polycode.service';
import { BlockchainService } from '../shared/blockchain.service';
import { BehaviorSubject, filter, map, take, tap } from 'rxjs';
import { networks } from '../shared/networks';
import { ActivatedRoute, Router } from '@angular/router';

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

  isUnsupportedNetwork$ = this.network$.pipe(
    map(network => {
      const supported =  this.supportedNetworks.filter(supportedNetwork => supportedNetwork.chainId === network?.chainId)
      return supported.length == 0
    })
  )

  routerA = this.router

  constructor(private blockchainService: BlockchainService,
    private router: Router) { }

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
