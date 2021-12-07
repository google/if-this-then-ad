import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Params } from '@angular/router';

@Component({
  selector: 'app-trigger-selector',
  templateUrl: './trigger-selector.component.html',
  styleUrls: ['./trigger-selector.component.scss']
})

export class TriggerSelectorComponent implements OnInit {
  paramSubscription: any;
  source: string|null = '';

  constructor(private route: ActivatedRoute) {
    this.source = this.route.snapshot.queryParamMap.get('source');
  }

  ngOnInit(): void {
  }
}
