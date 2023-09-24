import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TxQueueTopbarModuleComponent } from './tx-queue-topbar-module.component';

describe('TxQueueTopbarModuleComponent', () => {
  let component: TxQueueTopbarModuleComponent;
  let fixture: ComponentFixture<TxQueueTopbarModuleComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [TxQueueTopbarModuleComponent]
    });
    fixture = TestBed.createComponent(TxQueueTopbarModuleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
