import { StaticImageData } from 'next/image'
import standardImage from './images/standard.png'
import activation from './images/activation.png'
import deactivation from './images/deactivation.png'

export interface Card {
  id: number
  title: string
  image: StaticImageData
  description: string
  onChoose?: () => void
  onFindOutMore?: () => void
}

export const cards: Card[] = [
  {
    id: 1,
    title: 'Standard',
    description:
      'Request community votes to allocate RootstockCollective treasury funds for grants, growth initiatives, or governance goals.',
    image: standardImage,
  },
  {
    id: 2,
    title: 'Builder Activation',
    description:
      'Request community votes to add a Builder to the RootstockCollective whitelist, granting them rewards access.',
    image: activation,
  },
  {
    id: 3,
    title: 'Builder Deactivation',
    description:
      'Request community votes to remove a Builder from the RootstockCollective whitelist, revoking their rewards access.',
    image: deactivation,
  },
]
