import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { AddRuleComponent } from '../add-rule/add-rule.component';
import { AppRoutingModule } from '../app-routing.module';
import { AppComponent } from '../app.component';
import { BackLinkComponent } from '../back-link/back-link.component';
import { SourceSelectorComponent } from '../source-selector/source-selector.component';
import { TriggerSelectorComponent } from '../trigger-selector/trigger-selector.component';

import { BoxComponent } from './box.component';

describe('BoxComponent', () => {
  let component: BoxComponent;
  let fixture: ComponentFixture<BoxComponent>;

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
    fixture = TestBed.createComponent(BoxComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
