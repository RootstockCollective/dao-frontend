import { WHITELISTED_BUILDERS_URL } from '@/lib/constants'
import axios from 'axios'
import { BuilderOffChainInfo } from '@/app/bim/types'

export const fetchWhitelistedBuilders = () => axios.get<BuilderOffChainInfo[]>(`${WHITELISTED_BUILDERS_URL}`)
