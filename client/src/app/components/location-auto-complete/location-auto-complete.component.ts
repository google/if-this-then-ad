/**
    Copyright 2022 Google LLC
    Licensed under the Apache License, Version 2.0 (the "License");
    you may not use this file except in compliance with the License.
    You may obtain a copy of the License at
        https://www.apache.org/licenses/LICENSE-2.0
    Unless required by applicable law or agreed to in writing, software
    distributed under the License is distributed on an "AS IS" BASIS,
    WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
    See the License for the specific language governing permissions and
    limitations under the License.
 */

import {
  Component,
  Input,
  Output,
  EventEmitter,
  HostBinding,
  Optional,
  Self,
  ViewChild,
  ElementRef,
  Inject,
} from '@angular/core';
import { FormGroup, NgControl, FormBuilder } from '@angular/forms';
import { MatFormFieldControl } from '@angular/material/form-field';
import { Subject } from 'rxjs';
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
  providers: [
    { provide: MatFormFieldControl, useExisting: LocationAutoComplete },
  ],
})

/**
 * LocationAutoComplete component.
 */
export class LocationAutoComplete implements MatFormFieldControl<string> {
  @Input() dataPoint: string | undefined;
  @Input() value: string;
  @ViewChild('geoInput') geoInput: ElementRef;

  targetLocationValue: string | number | undefined = '';
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

  /**
   * Get placeholder.
   *
   * @returns {string}
   */
  @Input()
  get placeholder() {
    return this._placeholder;
  }

  /**
   * Set placeholder.
   *
   * @param {string} plh
   */
  set placeholder(plh) {
    this._placeholder = plh;
    this.stateChanges.next();
  }

  /**
   * On focus-in handler.
   *
   * @param {FocusEvent} event
   */
  onFocusIn(event: FocusEvent) {
    if (!this.focused) {
      this.focused = true;
      this.stateChanges.next();
    }
  }

  /**
   * On focus-out handler.
   *
   * @param {FocusEvent} event
   */
  onFocusOut(event: FocusEvent) {
    this.touched = true;
    this.focused = false;
    this.stateChanges.next();
  }

  /**
   * Getter function for empty.
   */
  get empty() {
    return !this.geoInput?.nativeElement.value;
  }

  /**
   * Should label float.
   *
   * @returns {boolean}
   */
  @HostBinding('class.floating')
  get shouldLabelFloat() {
    return this.focused || !this.empty;
  }

  /**
   * Get required.
   *
   * @returns {any}
   */
  @Input()
  get required() {
    return this._required;
  }

  /**
   * Set required.
   *
   * @param {any} req
   */
  set required(req) {
    this._required = coerceBooleanProperty(req);
    this.stateChanges.next();
  }

  /**
   * Get disabled.
   *
   * @returns {boolean}
   */
  @Input()
  get disabled(): boolean {
    return this._disabled;
  }

  /**
   * Set disabled.
   *
   * @param {boolean} value
   */
  set disabled(value: boolean) {
    this._disabled = coerceBooleanProperty(value);
    this.stateChanges.next();
  }

  /**
   * Get error state.
   *
   * @returns {boolean}
   */
  get errorState(): boolean {
    return !this.geoInput?.nativeElement.value && this.touched;
  }

  /**
   * Set described by ids.
   *
   * @param {string[]} ids
   */
  setDescribedByIds(ids: string[]) {}

  /**
   * Container-click handler.
   *
   * @param {MouseEvent} event
   */
  onContainerClick(event: MouseEvent) {}
  // END: Implementing the MatFormFieldControl interface

  /**
   * Constructor.
   *
   * @param {FormBuilder} fb
   * @param {NgControl} ngControl
   * @param {HttpClient} http
   * @param {AuthService} authService
   * @param {Document} document
   */
  constructor(
    fb: FormBuilder,
    @Optional() @Self() public ngControl: NgControl,
    private http: HttpClient,
    private authService: AuthService,
    @Inject(DOCUMENT) private document: Document
  ) {
    this.geoForm = fb.group({
      targetLocation: '',
    });
  }

  /**
   * Get target location.
   *
   * @returns {string}
   */
  @Input()
  get targetLocation() {
    return this.targetLocationValue;
  }

  /**
   * Set target location.
   *
   * @param {string} value
   */
  set targetLocation(value) {
    this.targetLocationValue = value;
    this.targetLocationChange.emit(this.targetLocationValue as string);
    this.stateChanges.next();
  }

  // eslint-disable-next-line require-jsdoc
  ngAfterViewInit(): void {
    this.initGeoSearch();
  }

  /**
   * Initialize geo search.
   */
  private async initGeoSearch() {
    const url =
      config.apiUrl + this.authService.getUserSetting('GOOGLEMAPS_API_KEY');

    this.getScriptOnce(url, () => {
      this.setGeoListener();
    });
  }

  /**
   * Get script once.
   *
   * @param {string} url
   * @param {Function} onLoad
   */
  private getScriptOnce(url: string, onLoad: Function) {
    if (LocationAutoComplete.scriptIsLoaded) {
      onLoad();
    } else {
      const script = this.document.createElement('script');
      script.innerHTML = '';
      script.src = url;
      script.async = true;
      script.defer = true;
      script.onload = () => {
        onLoad();
      };
      this.document.head.appendChild(script);

      LocationAutoComplete.scriptIsLoaded = true;
    }
  }

  /**
   * Set geo listener.
   */
  private setGeoListener() {
    const currentInput = this.geoInput.nativeElement;
    const autocomplete = new google.maps.places.Autocomplete(currentInput);

    autocomplete.setFields(['address_components', 'name']);

    autocomplete.addListener('place_changed', () => {
      const place = autocomplete.getPlace();
      const currentAddress = this.getFormatedAddress(place);

      currentInput.value = currentAddress;
      this.targetLocation = currentAddress;
    });
  }

  /**
   * Get formatted address.
   *
   * @param {any} place
   * @returns {string}
   */
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

    return (locality ? `${locality}, ` : '') + country;
  }

  /**
   * Check if object is iterable.
   *
   * @param {any} a
   * @returns {boolean}
   */
  private isIterable(a: any) {
    return a != null && Symbol.iterator in Object(a);
  }

  /**
   * Get API key.
   *
   * @param {string} name
   * @returns {string}
   */
  private getApiKey(name: string) {
    const settings = (this.authService as any)?.currentUser.settings;
    if (this.isIterable(settings)) {
      // eslint-disable-next-line guard-for-in
      for (const s in settings) {
        const param = settings[s]?.params;
        if (this.isIterable(param)) {
          for (const p in param) {
            if ('key' in (param[p] as Object) && name == param[p].key) {
              return param[p].value;
            }
          }
        }
      }
    }

    return '';
  }
}
