import { FC } from 'react'

export type GlowingLabelProps = {
  children: React.ReactNode
  showGlow?: boolean
}

export const GlowingLabel: FC<GlowingLabelProps> = ({ children, showGlow }) => (
  <div
    className="text-[#4b171a] text-base font-normal font-['KK-Topo'] uppercase"
    style={{
      background: 'linear-gradient(270deg, #4B171A -8.88%, #C0F7FF 31.43%, #E3FFEB 78.65%)',
      backgroundClip: 'text',
      WebkitBackgroundClip: 'text',
      WebkitTextFillColor: 'transparent',
      textShadow: showGlow ? '0px 0px 8.1px rgba(192, 247, 255, 0.65)' : 'inherit',
    }}
  >
    {children}
  </div>
)
