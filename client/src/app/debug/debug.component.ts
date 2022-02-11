import { Component, OnInit, ViewChild } from '@angular/core';
import { FormControl, FormGroup, NgForm } from '@angular/forms';

import { store } from '../store';

@Component({
  selector: 'app-debug',
  templateUrl: './debug.component.html',
  styleUrls: ['./debug.component.scss']
})
export class DebugComponent implements OnInit {
  saveEnabled: boolean = false;
  myForm = new FormGroup({
    firstName: new FormControl(''),
    lastName: new FormControl(''),
  });
  myForm2 = new FormGroup({
    firstName: new FormControl(''),
    lastName: new FormControl(''),
  });

  valid = this.myForm.valid;

  test: string = 'default';

  @ViewChild('mine', { static: true }) sourceForm: NgForm;

  constructor() {
    this.myForm.valueChanges.subscribe(val => {
      if (this.myForm.valid) {
        store.saveRequirements.next({...store.saveRequirements.value, ...{source: true}});
      } else {
        store.saveRequirements.next({...store.saveRequirements.value, ...{source: false}});
      }
    });

    this.myForm2.valueChanges.subscribe(val => {
      if (this.myForm2.valid) {
        store.saveRequirements.next({...store.saveRequirements.value, ...{condition: true}});
      } else {
        store.saveRequirements.next({...store.saveRequirements.value, ...{condition: false}});
      }
    });

    store.saveRequirements.subscribe(val => {
      this.saveEnabled = Object.values(store.saveRequirements.value).every(x => x);
      console.log('save enabled', this.saveEnabled);
    });
  }

  ngOnInit(): void {
    this.sourceForm.form.valueChanges.subscribe(val => {
      console.log('changed', val);
    });
  }
}
