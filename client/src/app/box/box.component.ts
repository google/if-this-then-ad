import { Component, Input, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-box',
  templateUrl: './box.component.html',
  styleUrls: ['./box.component.scss']
})
export class BoxComponent implements OnInit {
  @Input() source: string = '';

  constructor(public router: Router) { }

  ngOnInit(): void {
  }

  goToTriggerSelection() {
    this.router.navigate(['/trigger'], { queryParams: {source: this.source }});
  }
}
