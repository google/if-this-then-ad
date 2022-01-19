import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TriggersComponent } from './triggers.component';

describe('TriggersComponent', () => {
  let component: TriggersComponent;
  let fixture: ComponentFixture<TriggersComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TriggersComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TriggersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
