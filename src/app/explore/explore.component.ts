import { Component, OnInit } from '@angular/core';
import { ExploreService } from './explore.service';
import { from } from 'rxjs';

@Component({
  selector: 'app-explore',
  templateUrl: './explore.component.html',
  styleUrls: ['./explore.component.css']
})
export class ExploreComponent implements OnInit {

  tokens$ = from(this.exploreService.getTokens())

  constructor(private exploreService: ExploreService) {}

  ngOnInit(): void {

  }

}
