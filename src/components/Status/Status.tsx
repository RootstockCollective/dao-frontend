import { StatusSeverity } from '@/components/Status/types'
import { FC, JSX } from 'react'
import { Paragraph } from '@/components/Typography/Paragraph'
import classNames from 'classnames'

interface Status {
  severity: StatusSeverity
  label: string
}

const DEFAULT_CLASSES = 'inline-block text-black rounded-[4px] px-[16px] py-[3px]'

export const Status: FC<Status & JSX.IntrinsicElements['div']> = ({ severity = 'success', label, ...rest }) => {
  const classes = classNames({
    [DEFAULT_CLASSES]: true,
    'bg-st-success': severity === 'success',
    'bg-st-info': severity === 'in-progress',
    'bg-st-error': severity === 'rejected',
    'bg-st-white': severity === 'cancelled'
  })
  return (
    <div className={classes} {...rest}>
      <Paragraph variant='semibold'>{label}</Paragraph>
    </div>
  )
}
