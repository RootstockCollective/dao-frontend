import { FC, AnchorHTMLAttributes } from 'react'
import classnames from 'classnames'
import { PiArrowUpRightLight } from 'react-icons/pi'

interface LinkProps extends AnchorHTMLAttributes<HTMLAnchorElement> {
  variant?: 'default' | 'menu'
}

export const Link: FC<LinkProps> = ({ children, variant = 'default', ...props }) => {
  return (
    <a
      {...props}
      className={classnames(
        'inline-flex items-center gap-1.5 font-sora underline underline-offset-2 underline-thick hover:cursor-pointer w-fit',
        {
          'tracking-tight leading-tight text-base': variant === 'menu',
        },
        {
          'leading-normal text-sm': variant === 'default',
        },
      )}
    >
      <div>{children}</div>
      {variant === 'menu' && <PiArrowUpRightLight />}
    </a>
  )
}
