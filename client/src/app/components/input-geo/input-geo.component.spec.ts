import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InputGeoComponent } from './input-geo.component';

describe('InputGeoComponent', () => {
  let component: InputGeoComponent;
  let fixture: ComponentFixture<InputGeoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ InputGeoComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(InputGeoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
