import { 
  Component, Input, Output, EventEmitter, HostBinding,
  Optional, Self, ViewChild, ElementRef, Inject,
} from '@angular/core';
import { FormGroup, NgControl, FormBuilder } from '@angular/forms';
import { MatFormFieldControl } from '@angular/material/form-field';
import { Subject } from "rxjs";
import { coerceBooleanProperty } from '@angular/cdk/coercion';
import { HttpClient } from '@angular/common/http';
import { DOCUMENT } from '@angular/common';

import { config } from './config';
import { AuthService } from 'src/app/services/auth.service';
declare const google: any;

@Component({
  selector: 'app-location-auto-complete',
  templateUrl: './location-auto-complete.component.html',
  styleUrls: ['./location-auto-complete.component.scss'],
  providers: [{provide: MatFormFieldControl, useExisting: LocationAutoComplete}]
})
export class LocationAutoComplete implements MatFormFieldControl<string> {
  @Input() dataPoint: string|undefined;
  @Input() value: string;
  @ViewChild('geoInput') geoInput: ElementRef;

  targetLocationValue: string|number|undefined = '';
  @Output() targetLocationChange = new EventEmitter<string>();
  
  geoForm: FormGroup;
  static scriptIsLoaded = false;

  // START: Implementing the MatFormFieldControl interface
  private _disabled = false;
  private _placeholder: string;
  private _required = false;
  focused = false;
  touched = false;
  
  controlType = 'location-auto-complete';
  static nextId = 0;
  @HostBinding() id = `${this.controlType}-${LocationAutoComplete.nextId++}`;
  stateChanges = new Subject<void>();

  @Input()
  get placeholder() {
    return this._placeholder;
  }
  set placeholder(plh) {
    this._placeholder = plh;
    this.stateChanges.next();
  }

  onFocusIn(event: FocusEvent) {
    if (!this.focused) {
      this.focused = true;
      this.stateChanges.next();
    }
  }

  onFocusOut(event: FocusEvent) {
    this.touched = true;
    this.focused = false;
    this.stateChanges.next();
  }

  get empty() {
    return !this.geoInput?.nativeElement.value;
  }

  @HostBinding('class.floating')
  get shouldLabelFloat() {
    return this.focused || !this.empty;
  }

  @Input()
  get required() {
    return this._required;
  }
  set required(req) {
    this._required = coerceBooleanProperty(req);
    this.stateChanges.next();
  }

  @Input()
  get disabled(): boolean { 
    return this._disabled; 
  }
  set disabled(value: boolean) {
    this._disabled = coerceBooleanProperty(value);
    this.stateChanges.next();
  }

  get errorState(): boolean {
    return !this.geoInput?.nativeElement.value && this.touched;
  }

  setDescribedByIds(ids: string[]) {}

  onContainerClick(event: MouseEvent) {}
  // END: Implementing the MatFormFieldControl interface

  constructor(
    fb: FormBuilder, 
    @Optional() @Self() public ngControl: NgControl,
    private http: HttpClient,
    private authService: AuthService,
    @Inject(DOCUMENT) private document: Document
  ) {
    this.geoForm = fb.group({
      'targetLocation': '',
    });
  }

  @Input()
  get targetLocation() {
    return this.targetLocationValue;
  }

  set targetLocation(value) {
    this.targetLocationValue = value;
    this.targetLocationChange.emit(this.targetLocationValue as string);
    this.stateChanges.next();
  }

  ngAfterViewInit(): void {
    this.initGeoSearch();
  }

  private async initGeoSearch() {
    const url = config.apiUrl 
      + this.authService.getUserSetting('GOOGLEMAPS_API_KEY');

    this.getScriptOnce(url, () => {
      this.setGeoListener();
    });
  }

  private getScriptOnce(url: string, onLoad: Function) {
    if (LocationAutoComplete.scriptIsLoaded) {
      onLoad();
    } else {
      const script = this.document.createElement('script');
      script.innerHTML = '';
      script.src = url;
      script.async = true;
      script.defer = true;
      script.onload = () => { onLoad(); };
      this.document.head.appendChild(script);

      LocationAutoComplete.scriptIsLoaded = true;
    }
  }

  private setGeoListener() {
      const currentInput = this.geoInput.nativeElement;
      const autocomplete = new google.maps.places.Autocomplete(currentInput);

      autocomplete.setFields([
        "address_components",
        "name"
      ]);

      autocomplete.addListener('place_changed', () => {
        const place = autocomplete.getPlace();
        const currentAddress = this.getFormatedAddress(place);

        currentInput.value = currentAddress;
        this.targetLocation = currentAddress;
      });
  }

  private getFormatedAddress(place: any): string {
    let locality = '';
    let country = '';
    for (const component of place.address_components) {
      switch (component.types[0]) {
        case 'locality':
          locality = component.long_name;
          break;

        case 'country':
          country = component.long_name;
          break;
      }
    }

    return (locality ? `${locality}, `: '') + country;
  }

  private isIterable(a: any) {
    return a != null && Symbol.iterator in Object(a);
  }

  private getApiKey(name: string) {
    const settings = (this.authService as any)?.currentUser.settings;
    if (this.isIterable(settings)) {
      for (const s in settings) {
        const param = settings[s]?.params;
        if (this.isIterable(param)) {
          for (const p in param) {
            if (('key' in (param[p] as Object)) && name == param[p].key ) {
              return param[p].value;
            }
          }
        }
      }
    }

    return '';
  }
}
