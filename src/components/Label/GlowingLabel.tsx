import { cn } from '@/lib/utils'
import { FC, HTMLAttributes } from 'react'

export type GlowingLabelProps = HTMLAttributes<HTMLDivElement> & {
  showGlow?: boolean
  faded?: boolean
}

export const GlowingLabel: FC<GlowingLabelProps> = ({ children, showGlow, faded, className, ...rest }) => (
  <div
    data-testid="glowingLabel"
    className={cn(
      'text-[#4b171a] text-base',
      faded ? 'font-normal font-kk-topo uppercase' : 'font-bold font-rootstock-sans',
      className,
    )}
    style={{
      background: faded
        ? 'linear-gradient(270deg, #4B171A -8.88%, #C0F7FF 31.43%, #E3FFEB 78.65%)'
        : 'linear-gradient(270deg, #4B171A -456.96%, #C0F7FF -195.47%, #E3FFEB 110.84%)',
      backgroundClip: 'text',
      WebkitBackgroundClip: 'text',
      WebkitTextFillColor: 'transparent',
      textShadow: showGlow ? '0px 0px 8.1px rgb(192, 247, 255, 0.65)' : 'inherit',
    }}
    {...rest}
  >
    {children}
  </div>
)
