import axios from 'axios'
import { backersManagerAddress, network } from './env'
import fs from 'fs'
import { Address, getAddress } from 'viem'

async function geBackersList(): Promise<any[]> {
  const topic = '0xed07ca57097393e77ba36105a07f6810afc2180b72a9c02a4b0da4b51a73a6ec'
  const url = `https://rws.app.rootstockcollective.xyz/address/${backersManagerAddress}/eventsByTopic0?topic0=${topic}&chainId=${network.id}&fromBlock=0`
  try {
    const response = await axios.get(url)
    const events: any[] = response.data

    const backersList: Address[] = []
    for (const event of events) {
      const backerAddress = getAddress(`0x${event.topics[1].slice(-40)}`)
      if (backersList.includes(backerAddress)) continue
      backersList.push(backerAddress)
    }

    const outputFile = `./backersLists/backersList-${backersManagerAddress}.json`
    fs.writeFileSync(outputFile, JSON.stringify(backersList, null, 2))
    console.info(`Backers list saved to ${outputFile}`)
    return backersList
  } catch (error) {
    console.error('Error fetching NFT holders:', error)
    return []
  }
}

async function main() {
  await geBackersList()
}

main().catch(console.error)
