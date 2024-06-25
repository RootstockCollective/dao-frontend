import { ethers } from 'ethers'
import { rLoginConnector } from '../utils/rLoginConnector'
import { create } from 'zustand'

export interface IConnection {
  provider: ethers.BrowserProvider | null
  signer: ethers.Signer | null
  address: string
  connect: Function
  disconnect: Function | null
  isConnected: Boolean
  checkConnection: Function
}

export const useConnection = create<IConnection>((set, get) => ({
  address: '',
  provider: null,
  signer: null,
  disconnect: null,
  isConnected: false,
  connect: async (provider: ethers.BrowserProvider | null) => {
    let _provider: ethers.BrowserProvider

    if (!provider) {
      const connection = await rLoginConnector.connect()
      _provider = new ethers.BrowserProvider(connection.provider)
    } else {
      _provider = provider
    }

    const _signer = await _provider.getSigner(0)
    const _address = await _signer.getAddress()

    set(_state => ({
      provider: _provider,
      signer: _signer,
      address: _address,
      isConnected: true,
    }))
  },
  checkConnection: async () => {
    if (typeof window?.ethereum !== 'undefined') {
      const provider = new ethers.BrowserProvider(window.ethereum)
      const accounts = await provider.listAccounts()

      if (accounts.length > 0) {
        get().connect(provider)
      }
    }
  },
}))
