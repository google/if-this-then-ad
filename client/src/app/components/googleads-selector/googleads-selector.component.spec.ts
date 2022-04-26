import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GoogleAdsSelectorComponent } from './googleads-selector.component';

describe('GoogleAdsSelectorComponent', () => {
  let component: GoogleAdsSelectorComponent;
  let fixture: ComponentFixture<GoogleAdsSelectorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ GoogleAdsSelectorComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(GoogleAdsSelectorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
