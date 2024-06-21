import { PropsWithChildren, FC, AnchorHTMLAttributes } from 'react'
import classnames from 'classnames'
import { PiArrowUpRightLight } from 'react-icons/pi'

interface LinkProps extends AnchorHTMLAttributes<HTMLAnchorElement> {
  /* 
  Not using enum here to avoid importing this enum everywhere along with the component
  */
  variant?: 'default' | 'menu'
}

export const Link: FC<LinkProps> = ({ children, variant = 'default', ...props }) => {
  return (
    <a
      {...props}
      className={classnames(
        'flex items-center gap-1.5 underline underline-offset-2 underline-thick hover:cursor-pointer w-fit',
        {
          'tracking-tight leading-tight text-base font-sora': variant === 'menu',
        },
        {
          'leading-normal text-sm font-inter': variant === 'default',
        },
      )}
    >
      <div>{children}</div>
      {variant === 'menu' && <PiArrowUpRightLight />}
    </a>
  )
}
