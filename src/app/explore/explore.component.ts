import { Component, OnInit } from '@angular/core';
import { ExploreService, TokenBalanceInfo } from './explore.service';
import { from, map } from 'rxjs';

@Component({
  selector: 'app-explore',
  templateUrl: './explore.component.html',
  styleUrls: ['./explore.component.css']
})
export class ExploreComponent implements OnInit {

  tokens$ = from(this.exploreService.getTokens()).pipe(
    map(tokens => {
      return tokens.filter((token: TokenBalanceInfo) => token.balance.gt(0))
    })
  )

  constructor(private exploreService: ExploreService) {}

  ngOnInit(): void {

  }

}
