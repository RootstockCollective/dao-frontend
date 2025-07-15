import React from 'react'
import InfoIcon from './InfoIcon'

export default function PreviewLabel() {
  return (
    <div className="flex gap-1 items-center justify-end flex-nowrap">
      <InfoIcon />
      <p className="text-sm  md:text-base font-rootstock-sans leading-tight text-text-40 whitespace-nowrap">
        This is a preview of how the proposal will look
      </p>
    </div>
  )
}
