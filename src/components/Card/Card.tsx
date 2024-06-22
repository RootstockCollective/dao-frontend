import { FC } from 'react'
import { Label } from '../Typography'
import { Paragraph } from '../Typography/Paragraph'
import classNames from 'classnames'

const DEFAULT_CLASSES = 'p-4 border border-white rounded-lg h-[120px]'

interface Props {
  title: string
  content: string
  footer?: string
  borderless?: boolean
}

export const Card: FC<Props> = ({ title, content, footer, borderless = false }) => {
  const borderClass = borderless ? 'border-0' : 'border-1'
  return (
    <div className={(classNames(DEFAULT_CLASSES), borderClass)}>
      <Label variant="light" textClass="text-sm">
        {title}
      </Label>
      <Paragraph>{content}</Paragraph>
      <Label variant="light" textClass="text-sm">
        {footer}
      </Label>
    </div>
  )
}
