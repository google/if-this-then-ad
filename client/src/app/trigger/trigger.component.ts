import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'app-trigger',
  templateUrl: './trigger.component.html',
  styleUrls: ['./trigger.component.scss']
})
export class TriggerComponent implements OnInit {
  @Input() name: string = '';
  @Input() type: string = '';
  @Input() condition: string = '';
  @Input() value: any = null;

  constructor() { }

  ngOnInit(): void {
  }

}
