import { Component, OnInit } from '@angular/core';
import { BehaviorSubject, map, tap } from 'rxjs';
import { PolycodeService } from './shared/polycode.service';
import { BlockchainService } from './shared/blockchain.service';
import { networks } from './shared/networks';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  title = 'multichain-token';

  address$ = this.blockchainService.account$
  balance$ = this.blockchainService.balance$.pipe(

  )

  hasProviderSub = new BehaviorSubject(false)
  hasProvider$ = this.hasProviderSub.asObservable()

  constructor(private blockchainService: BlockchainService) {

  }

  ngOnInit(): void {
    if((window as any).ethereum === undefined) {
      this.hasProviderSub.next(false)
    } else {
      this.hasProviderSub.next(true)
    }
  }

  authWallets() {
    this.blockchainService.auth()
  }

}
