import { Paragraph } from '../Typography'

export const CopyrightInfo = () => {
  const year = new Date().getFullYear()
  const brand = 'RootstockCollective'
  return (
    <div className="flex flex-col">
      <Paragraph>Built by {brand}</Paragraph>
      <Paragraph className="leading-[100%]">
        Copyright © {year} {brand}. All rights reserved.
      </Paragraph>
    </div>
  )
}
