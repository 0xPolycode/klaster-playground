export interface Network {
    chainId: number,
    name: string,
    logoUri: string,
    rpcUrls: string[],
    nativeCurrency: {
        name: string,
        symbol: string,
        decimals: number
    },
    blockExploreUrls: string[]
}

export const networks: Network[] = [
    { 
        chainId: 80001, 
        name: 'Mumbai Matic', 
        logoUri: 'matic.png', 
        rpcUrls: ['https://polygon-mumbai-bor.publicnode.com'],
        nativeCurrency: {
            name: 'MATIC',
            symbol: 'MATIC',
            decimals: 18
        },
        blockExploreUrls: ['https://polygonscan.com/']
    },
    {
        chainId: 43113,
        name: 'Avalanche Fuji',
        logoUri: 'avax-logo.png',
        rpcUrls: ['https://api.avax-test.network/ext/bc/C/rpc'],
        nativeCurrency: {
            name: 'ETH',
            symbol: 'ETH',
            decimals: 18
        },
        blockExploreUrls: ['https://snowtrace.io/']
    },
    { 
        chainId: 420, 
        name: 'Optimism Goerli', 
        logoUri: 'op.png', 
        rpcUrls: ['https://optimism-goerli.public.blastapi.io'],
        nativeCurrency: {
            name: 'ETH',
            symbol: 'ETH',
            decimals: 18
        },
        blockExploreUrls: ['https://optimistic.etherscan.io/']
    },
    { 
        chainId: 11155111, 
        name: 'Ethereum Sepolia', 
        logoUri: 'eth.png', 
        rpcUrls: ['https://ethereum-sepolia.blockpi.network/v1/rpc/public'],
        nativeCurrency: {
            name: 'ETH',
            symbol: 'ETH',
            decimals: 18
        },
        blockExploreUrls: ['https://sepolia.etherscan.io/']
    }
]

export function getNetworkFromChainID(chainId: number): Network | undefined {
    return networks.filter(network => network.chainId === chainId).at(0)
}