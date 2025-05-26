import { Paragraph } from '../../Typography'

export const CopyrightInfo = () => {
  const year = new Date().getFullYear()
  const brand = 'RootstockCollective'
  return (
    <div className="flex flex-col">
      <Paragraph className="font-normal text-[14px]">Built by {brand}</Paragraph>
      <Paragraph className="leading-[100%] font-normal text-[14px]">
        Copyright © {year}. All rights reserved.
      </Paragraph>
    </div>
  )
}
