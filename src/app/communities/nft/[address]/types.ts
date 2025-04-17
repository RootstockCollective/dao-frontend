import { Address } from 'viem'

export type NFTWalletLocalStorage = Record<Address, Record<number, boolean>>
