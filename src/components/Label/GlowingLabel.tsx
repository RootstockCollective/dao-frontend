import { FC } from 'react'

export type GlowingLabelProps = {
  children: React.ReactNode
  showGlow?: boolean
}

export const FadedGlowingLabel: FC<GlowingLabelProps> = ({ children, showGlow }) => (
  <div
    data-testid="fadedGlowingLabel"
    className="text-[#4b171a] text-base font-normal font-kk-topo uppercase"
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

export const GlowingLabel: FC<GlowingLabelProps> = ({ children, showGlow }) => (
  <div
    data-testid="glowingLabel"
    className="text-[#4b171a] font-bold font-rootstock-sans"
    style={{
      background: 'linear-gradient(270deg, #4B171A -456.96%, #C0F7FF -195.47%, #E3FFEB 110.84%)',
      backgroundClip: 'text',
      WebkitBackgroundClip: 'text',
      WebkitTextFillColor: 'transparent',
      textShadow: showGlow ? '0px 0px 8px rgb(192, 247, 255, 0.65)' : 'inherit',
    }}
  >
    {children}
  </div>
)
