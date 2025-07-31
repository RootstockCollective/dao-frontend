import { Builder } from '@/app/types'
import { FC } from 'react'
import { BuilderCardControl } from '../BuilderCard'

interface BuildersSpotlightProps {
  builders: Builder[]
}

export const BuildersSpotlight: FC<BuildersSpotlightProps> = ({ builders }) => (
  <div className="grid grid-cols-4 gap-2 w-full items-stretch">
    {builders.map(builder => (
      <BuilderCardControl key={builder.address} {...builder} />
    ))}
  </div>
)
