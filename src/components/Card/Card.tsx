import { FC } from 'react'

interface Props {
  title: string
  content: string
  footer: string
}

export const Card: FC<Props> = ({ title, content, footer }) => (
  <div className="p-4 border border-white rounded-lg border-1">
    <div className="text-gray-400 text-sm">{title}</div>
    <div className="text-white text-3xl font-bold mt-1">{content}</div>
    <div className="text-gray-400 text-sm mt-1">{footer}</div>
  </div>
)
