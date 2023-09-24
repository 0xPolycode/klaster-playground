import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DeployComponent } from './deploy/deploy.component';
import { BridgeComponent } from './bridge/bridge.component';
import { CrossChainTxComponent } from './cross-chain-tx/cross-chain-tx.component';
import { PayComponent } from './pay/pay.component';
import { LendComponent } from './lend/lend.component';
import { WrapComponent } from './wrap/wrap.component';
import { GatewayComponent } from './gateway/gateway.component';
import { ExploreComponent } from './explore/explore.component';

const routes: Routes = [
  { path: 'dapps/deploy', component: DeployComponent },
  { path: 'dapps/bridge', component: BridgeComponent },
  { path: 'dapps/cctx', component: CrossChainTxComponent },
  { path: 'dapps/pay', component: PayComponent },
  { path: 'dapps/lend', component: LendComponent },
  { path: 'dapps/wrap', component: WrapComponent },
  { path: 'gateway', component: GatewayComponent },
  { path: 'dapps/explore', component: ExploreComponent }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
