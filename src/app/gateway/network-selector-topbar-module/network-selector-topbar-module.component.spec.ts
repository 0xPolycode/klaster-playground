import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NetworkSelectorTopbarModuleComponent } from './network-selector-topbar-module.component';

describe('NetworkSelectorTopbarModuleComponent', () => {
  let component: NetworkSelectorTopbarModuleComponent;
  let fixture: ComponentFixture<NetworkSelectorTopbarModuleComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [NetworkSelectorTopbarModuleComponent]
    });
    fixture = TestBed.createComponent(NetworkSelectorTopbarModuleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
