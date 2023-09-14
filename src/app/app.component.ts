import { Component, OnInit } from '@angular/core';
import { BehaviorSubject, tap } from 'rxjs';
import { PolycodeService } from './shared/polycode.service';
import { BlockchainService } from './shared/blockchain.service';
import { attach } from "@polyflow/sdk";

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  title = 'multichain-token';

  address$ = this.blockchainService.account$
  balance$ = this.blockchainService.balance$.pipe(
    tap(balance => {
      console.log(balance)
    })
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

    attach("JW6aA.meLY1F2m2-xoLSfIMNmc_RS_aV0BH_yPgWFSEY-", {
      logEnabled: true
    });
  }

  authWallets() {
    this.blockchainService.auth()
  }

}
