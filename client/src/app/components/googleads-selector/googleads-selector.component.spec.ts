import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GoogleadsSelectorComponent } from './googleads-selector.component';

describe('GoogleadsSelectorComponent', () => {
  let component: GoogleadsSelectorComponent;
  let fixture: ComponentFixture<GoogleadsSelectorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ GoogleadsSelectorComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(GoogleadsSelectorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
