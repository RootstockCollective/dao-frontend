import React from 'react'
import InfoIcon from './InfoIcon'
import { Paragraph } from '@/components/Typography'

export function PreviewLabel() {
  return (
    <div className="flex items-center md:justify-end flex-nowrap md:mt-0 mt-10">
      <InfoIcon />
      <Paragraph variant="body" className="text-text-40">
        This is a preview of how the proposal will look
      </Paragraph>
    </div>
  )
}
