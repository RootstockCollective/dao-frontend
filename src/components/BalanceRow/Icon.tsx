import { FC } from 'react'

interface Props {
  icon: React.ReactNode
}

export const Icon: FC<Props> = ({ icon }) => <div className="mr-3 bg-foreground">{icon}</div>
