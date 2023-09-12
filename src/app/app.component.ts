import { Component, OnInit } from '@angular/core';
import { BehaviorSubject, tap } from 'rxjs';
import { PolycodeService } from './shared/polycode.service';
import { BlockchainService } from './shared/blockchain.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'multichain-token';

  address$ = this.blockchainService.account$
  balance$ = this.blockchainService.balance$.pipe(
    tap(balance => {
      console.log(balance)
    })
  )

  constructor(private blockchainService: BlockchainService) {}


  authWallets() {
    this.blockchainService.auth()
  }

}
