import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LocationAutoComplete } from './location-auto-complete.component';

describe('InputGeoComponent', () => {
  let component: LocationAutoComplete;
  let fixture: ComponentFixture<LocationAutoComplete>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [LocationAutoComplete],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(LocationAutoComplete);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
