import { Injectable } from '@angular/core';
import { BlockchainService } from '../shared/blockchain.service';
import { DeployData } from '../shared/polycode.service';
const KlasterGovernorABI = require('../../assets/abis/KlasterGovernorABI.json')
import { ContractFactory, ethers } from 'ethers';

@Injectable({
  providedIn: 'root'
})
export class DeployService {

  private GOVERNOR_ADDRESS = '0x1670f0f1fc1e2d935f76480e0f8220af6a1f8caf'

  constructor(private blockchainService: BlockchainService) { }

  async deployToken(tokenName: string, tokenSymbol: string, salt: number, deployments: DeployData[]) {

    const governor = this.getGovernor()

    const deployFee = await governor['getBatchDeployFee'](
      this.blockchainService.getAccount(),
      tokenName,
      tokenSymbol,
      salt,
      deployments.map(deployment => parseInt(deployment.chainId)),
      deployments.map(deployment => parseInt(deployment.supply))
    )

    return await governor['batchDeploy'](
      tokenName,
      tokenSymbol,
      salt, 
      deployments.map(deployment => parseInt(deployment.chainId)),
      deployments.map(deployment => parseInt(deployment.supply)),
      {
        value: deployFee
      }
    )
    
  }

  private getGovernor() {
    return new ethers.Contract(this.GOVERNOR_ADDRESS, KlasterGovernorABI, this.blockchainService.provider?.getSigner())
  }

  async precalculateTokenAddress(name: string, symbol: string, salt: string) {
    const governor = this.getGovernor()
    return await governor['calculateAddress'](
      this.blockchainService.getAccount(),
      name,
      symbol,
      salt
    )
  }

}
