import { Component, OnInit } from '@angular/core';
import { BehaviorSubject, from, switchMap } from 'rxjs';
import { DeployData, PolycodeService } from '../shared/polycode.service';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { DeployService } from './deploy.service';

@Component({
  selector: 'app-deploy',
  templateUrl: './deploy.component.html',
  styleUrls: ['./deploy.component.css']
})
export class DeployComponent {

  deployForm = new FormGroup({
    tokenName: new FormControl('', [Validators.required]),
    tokenSymbol: new FormControl('', [Validators.required]),
    ethSupply: new FormControl(0, []),
    maticSupply: new FormControl(0, []),
    opSupply: new FormControl(0, []),
    sepoliaEthSupply: new FormControl(0, []),
    mumbaiMaticSupply: new FormControl(0, []),
    goerliOpSupply: new FormControl(0, [])
  })

  deployedTokenAddressSub = new BehaviorSubject<string | null>(null)
  deployedTokenAddress$ = this.deployedTokenAddressSub.asObservable()

  deployedTokenTxHashSub = new BehaviorSubject<string | null>(null)
  deployedTokenTxHash$ = this.deployedTokenTxHashSub.asObservable()

  deploymentLoadingSub = new BehaviorSubject(false)
  deployementLoading$ = this.deploymentLoadingSub.asObservable()

  constructor(private deployService: DeployService) { }

  showTestnetsSub = new BehaviorSubject(true)
  showTestnets$ = this.showTestnetsSub.asObservable()

  toggleTestnets() {
    this.showTestnetsSub.next(!this.showTestnetsSub.value)
  }


  deploy() {

    if(this.deploymentLoadingSub.value === true) {
      return
    }

    this.deploymentLoadingSub.next(true)

    const salt = 1
    const controls = this.deployForm.controls

    var supplies: DeployData[] = []

    if(controls.ethSupply.value !== 0) {
      supplies.push(
        {
          chainId: '1',
          supply: controls.ethSupply.value!.toString()
        }
      )
    }
    if (controls.sepoliaEthSupply.value !== 0) {
      supplies.push(
        {
          chainId: '11155111',
          supply: controls.sepoliaEthSupply.value!.toString()
        }
      )
    } 
    if (controls.maticSupply.value !== 0) {
      supplies.push(
        {
          chainId: '137',
          supply: controls.maticSupply.value!.toString()
        }
      )
    } 
    if (controls.mumbaiMaticSupply.value !== 0) {
      supplies.push(
        {
          chainId: '80001',
          supply: controls.mumbaiMaticSupply.value!.toString()
        }
      )
    }
    if(controls.goerliOpSupply.value !== 0) {
      supplies.push(
        {
          chainId: '420',
          supply: controls.goerliOpSupply.value!.toString()
        }
      )
    }

    this.deployService.deployToken(
      controls.tokenName.value!,
      controls.tokenSymbol.value!,
      salt,
      supplies
    ).then(tokenDeployTx => {

      tokenDeployTx.wait().then((tx: any) => {
        this.deployService.precalculateTokenAddress(
          controls.tokenName.value!,
          controls.tokenSymbol.value!,
          salt.toString()
        ).then(tokenAddress => {
          this.deployedTokenAddressSub.next(tokenAddress)
          this.deployedTokenTxHashSub.next(tokenDeployTx.hash)
        })
      })
      
    }).catch(err => {
      this.deploymentLoadingSub.next(false)
      alert(err)
    })
  }

}
