import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

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
    LendComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    ReactiveFormsModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
