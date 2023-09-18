import { Injectable } from '@angular/core';
import { BlockchainService } from '../shared/blockchain.service';
import { BigNumber, ethers } from 'ethers';
import { GOVERNOR_ADDRESS } from '../shared/contract-addresses';
import { networks } from '../shared/networks';
const KlasterGovernorABI = require('../../assets/abis/KlasterGovernorABI.json')

@Injectable({
  providedIn: 'root'
})
export class ExploreService {

  constructor(private blockchainService: BlockchainService) { }

  async getTokens(): Promise<TokenBalanceInfo[]> {
    const acb = await networks.map(async (network) => {
      const provider = this.blockchainService.getReadProvider(network.chainId)
      if(provider){ return await this.getTokenForProvider(provider?.provider) }
      return []
    })
    return acb.at(1)!
  }

  private async getTokenForProvider(provider: ethers.providers.JsonRpcProvider): Promise<TokenBalanceInfo[]> {
    const governor = new ethers.Contract(GOVERNOR_ADDRESS,
      KlasterGovernorABI,
      provider)

   const tokens =  await governor['getTokens'](
     this.blockchainService.getAccount()
   )
   return tokens.map((token: any) => {
     return {
       address: token[0],
       name: token[1],
       symbol: token[2],
       decimals: token[3],
       balance: BigNumber.from(token[4])
     } as TokenBalanceInfo
   })
  }
}


export interface TokenBalanceInfo {
  name: string,
  symbol: string,
  decimals: number,
  address: string,
  balance: ethers.BigNumber
}