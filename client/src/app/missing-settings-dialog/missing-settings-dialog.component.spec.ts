import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MissingSettingsDialogComponent } from './missing-settings-dialog.component';

describe('MissingSettingsDialogComponent', () => {
  let component: MissingSettingsDialogComponent;
  let fixture: ComponentFixture<MissingSettingsDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MissingSettingsDialogComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(MissingSettingsDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
