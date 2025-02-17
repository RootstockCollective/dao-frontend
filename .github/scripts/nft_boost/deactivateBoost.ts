import * as fs from 'fs'
import { nftActiveBoostPath } from './consts'

async function main() {
  fs.writeFileSync(nftActiveBoostPath, 'None')
  console.log(`Deactivated nft boost by deleting the file content: ${nftActiveBoostPath}`)
}

main().catch(console.error)
