import { Injectable } from '@angular/core';
import { BigNumber, ethers } from 'ethers';
const KlasterERC20ABI = require("../../assets/abis/KlasterERC20.json")
import { BlockchainService } from '../shared/blockchain.service';

@Injectable({
  providedIn: 'root'
})
export class SwapService {

  private x0 = '0x0000000000000000000000000000000000000000'

  constructor(private blockchainService: BlockchainService) { }

  async swapTokens(sourceContractAddress: string, destinationChainID: number, sendAmount: number) {

    const tokenContract = new ethers.Contract(sourceContractAddress, 
        KlasterERC20ABI, 
        this.blockchainService.provider?.getSigner() 
    )

    const swapFunctionInterface = [
      `function swapExactTokensForTokens(uint amountIn, uint amountOutMin, address[] calldata path, address to, uint deadline)`
    ]
    const swapInterface = new ethers.utils.Interface(swapFunctionInterface)

    var now = new Date();
    now.setHours(now.getHours() + 1);

    const encodedData = swapInterface.encodeFunctionData("swapExactTokensForTokens", [
      sendAmount,
      0,
      ['0x114CF2089c88D64Ae9c3FDc90E8fD568E79B9681', '0xFC50147680cceca0050123d0CD4304F35FCf7e5c'],
      this.blockchainService.getAccount(),
      ethers.BigNumber.from(Math.floor(now.getTime() / 1000))
    ])

    const uniswap = this.getUniswapContractDeployment(destinationChainID)

    return await tokenContract['rtc'](
      destinationChainID,
      0,
      this.x0,
      sendAmount,
      uniswap,
      encodedData,
      500000,
      true, 
      {
        value: ethers.utils.parseEther("0.005")
      }
    )

  }

  async calculateReceiveUniswap(chainID: number, amountSwap: number) {

    const tokenA = "0x114CF2089c88D64Ae9c3FDc90E8fD568E79B9681"

    const contractInterface = ['function getAmountsOut(uint amountIn, address[] calldata path) external view returns (uint[] memory amounts)']
    const uniswapAddress = this.getUniswapContractDeployment(chainID)

    const uniswapContract = new ethers.Contract(
        uniswapAddress, 
        contractInterface, 
        this.blockchainService.getReadProvider(chainID)!.provider
    )

    const tokenAContract = this.getTokenContract(tokenA)
    const decimals = (await tokenAContract['decimals']()) as number

    console.log(`
      Chain ID: ${chainID}, amountSwap: ${amountSwap}, uniswapAddr: ${uniswapAddress}, decimals: ${decimals},
      swapa amount: ${ethers.utils.parseUnits(amountSwap.toString(), decimals)}
    `)

    return ((
      await uniswapContract['getAmountsOut'](
        ethers.utils.parseUnits(amountSwap.toString(), decimals),
        ["0x114CF2089c88D64Ae9c3FDc90E8fD568E79B9681", "0xFC50147680cceca0050123d0CD4304F35FCf7e5c"]
      )
    ).at(1) as ethers.BigNumber).div(ethers.BigNumber.from(10).pow(decimals))
  }

  getUniswapContractDeployment(chainId: number) {
    return chainId === 420 ? 
    "0x8d2915D89912Ba7bfBe2a5EA20BE6A1BBea7DB94" :
    "0xC532a74256D3Db42D0Bf7a0400fEFDbad7694008"
  }

  async getTokenBalance(address: string) {
    const tokenContract = this.getTokenContract(address)

    const balance: ethers.BigNumber = await tokenContract['balanceOf'](this.blockchainService.getAccount())
    const decimals  = await tokenContract['decimals']()

    return balance.div(ethers.BigNumber.from(10).pow(decimals))
  }

  async mintToken(address: string) {

    const tokenContract = this.getTokenContract(address)

    const decimals = await tokenContract['decimals']()

    const mintResult = await tokenContract['mint'](
      this.blockchainService.getAccount(),
      ethers.utils.parseUnits("100", decimals)
    )

    return mintResult
  }

  private getTokenContract(address: string) {
    return new ethers.Contract(address,
      KlasterERC20ABI,
      this.blockchainService.provider?.getSigner())
  }
}
