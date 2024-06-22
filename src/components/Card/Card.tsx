import { FC } from 'react'
import { Label } from '../Typography'
import { Paragraph } from '../Typography/Paragraph'

interface Props {
  title: string
  content: string
  footer: string
}

export const Card: FC<Props> = ({ title, content, footer }) => (
  <div className="p-4 border border-white rounded-lg border-1 h-[120px]">
    <Label variant="light" textClass="text-sm">
      {title}
    </Label>
    <Paragraph>{content}</Paragraph>
    <Label variant="light" textClass="text-sm">
      {footer}
    </Label>
  </div>
)
