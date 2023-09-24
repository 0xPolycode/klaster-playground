import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AccountsPreviewTopbarModuleComponent } from './accounts-preview-topbar-module.component';

describe('AccountsPreviewTopbarModuleComponent', () => {
  let component: AccountsPreviewTopbarModuleComponent;
  let fixture: ComponentFixture<AccountsPreviewTopbarModuleComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [AccountsPreviewTopbarModuleComponent]
    });
    fixture = TestBed.createComponent(AccountsPreviewTopbarModuleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
