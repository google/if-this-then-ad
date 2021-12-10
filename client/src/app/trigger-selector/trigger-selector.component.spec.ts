import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { AddRuleComponent } from '../add-rule/add-rule.component';
import { AppRoutingModule } from '../app-routing.module';
import { AppComponent } from '../app.component';
import { BackLinkComponent } from '../back-link/back-link.component';
import { BoxComponent } from '../box/box.component';
import { SourceSelectorComponent } from '../source-selector/source-selector.component';

import { TriggerSelectorComponent } from './trigger-selector.component';

describe('TriggerSelectorComponent', () => {
  let component: TriggerSelectorComponent;
  let fixture: ComponentFixture<TriggerSelectorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [
        AppComponent,
        SourceSelectorComponent,
        BoxComponent,
        TriggerSelectorComponent,
        AddRuleComponent,
        BackLinkComponent
      ],
      imports: [
        BrowserModule,
        AppRoutingModule,
        BrowserAnimationsModule
      ],
      providers: []
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TriggerSelectorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
