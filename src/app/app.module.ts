import { NgModule, APP_INITIALIZER } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { from, Observable } from 'rxjs';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { DeployComponent } from './deploy/deploy.component';
import { BridgeComponent } from './bridge/bridge.component';
import { NavbarComponent } from './navbar/navbar.component';
import { ReactiveFormsModule } from '@angular/forms';
import { ShortenPipe } from './shared/pipes/shorten.pipe';
import { LoaderComponent } from './shared/components/loader/loader.component';
import { CrossChainTxComponent } from './cross-chain-tx/cross-chain-tx.component';
import { WrapComponent } from './wrap/wrap.component';
import { PayComponent } from './pay/pay.component';
import { LendComponent } from './lend/lend.component';
import { GatewayComponent } from './gateway/gateway.component';
import { SafePipe } from './shared/pipes/safe.pipe';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations'
import { attach } from "@polyflow/sdk";
import { ExploreComponent } from './explore/explore.component';
import { NetworkSelectorTopbarModuleComponent } from './gateway/network-selector-topbar-module/network-selector-topbar-module.component';
import { TxQueueTopbarModuleComponent } from './gateway/tx-queue-topbar-module/tx-queue-topbar-module.component';
import { AccountsPreviewTopbarModuleComponent } from './gateway/accounts-preview-topbar-module/accounts-preview-topbar-module.component';

@NgModule({
  declarations: [
    AppComponent,
    DeployComponent,
    BridgeComponent,
    NavbarComponent,
    ShortenPipe,
    LoaderComponent,
    CrossChainTxComponent,
    WrapComponent,
    PayComponent,
    LendComponent,
    GatewayComponent,
    SafePipe,
    ExploreComponent,
    NetworkSelectorTopbarModuleComponent,
    TxQueueTopbarModuleComponent,
    AccountsPreviewTopbarModuleComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    ReactiveFormsModule
  ],
  providers: [{
    provide: APP_INITIALIZER,
    useFactory: initApp,
    deps: [],
    multi: true
  }],
  bootstrap: [AppComponent]
})
export class AppModule { }

function initApp(): () => Observable<string> {
  return () => from(
    attach("JW6aA.meLY1F2m2-xoLSfIMNmc_RS_aV0BH_yPgWFSEY-")
  );
}
