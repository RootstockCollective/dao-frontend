import { Button, ButtonProps } from '@/components/Button'
import { ConfigSvg } from '@/components/ConfigSvg'
import { FC } from 'react'

export const SettingsButton: FC<Omit<ButtonProps, 'children'>> = props => (
  <Button {...props} variant="outlined" className="flex w-[54px] self-stretch border-[#2D2D2D]">
    <ConfigSvg />
  </Button>
)
