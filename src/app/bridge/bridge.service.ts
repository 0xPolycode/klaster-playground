import { Injectable } from '@angular/core';
import { BlockchainService } from '../shared/blockchain.service';
import { ethers } from 'ethers';
import { GOVERNOR_ADDRESS } from '../shared/contract-addresses';
const KlasterGovernorABI = require("../../assets/abis/KlasterGovernorABI.json") 
const KlasterERC20 = require("../../assets/abis/KlasterERC20.json")

@Injectable({
  providedIn: 'root'
})
export class BridgeService {


  constructor(private blockchainService: BlockchainService) { }

  async getMyTokens() {
    const governor = new ethers.Contract(
      GOVERNOR_ADDRESS,
      KlasterGovernorABI,
      this.blockchainService.provider.getSigner()
    )

    return await governor['getTokens'](
      this.blockchainService.getAccount()
    )
  }
  
  async getBalance(address: string) {
    const token = new ethers.Contract(
      address,
      KlasterERC20,
      this.blockchainService.provider.getSigner()
    )
    return await token['balanceOf'](
      this.blockchainService.getAccount()
    )
  }

}
