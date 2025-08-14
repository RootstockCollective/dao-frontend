import React from 'react'
import InfoIcon from './InfoIcon'
import { BaseTypography } from '@/components/Typography/Typography'

export function PreviewLabel() {
  return (
    <div className="flex gap-1 items-center justify-end flex-nowrap">
      <InfoIcon />
      <BaseTypography className="text-sm md:text-base leading-tight text-text-40 whitespace-nowrap">
        This is a preview of how the proposal will look
      </BaseTypography>
    </div>
  )
}
