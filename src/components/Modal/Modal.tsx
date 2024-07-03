import { FC, ReactNode } from 'react'
import { cn } from '@/lib/utils'

interface Props {
  children: ReactNode
  onClose: () => void
  width: number
}
export const Modal: FC<Props> = ({ 
  children, 
  onClose,
  width,
}) => {

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 rounded-[8px]">
      <div className="fixed inset-0 backdrop-filter backdrop-blur-md transition-opacity" onClick={onClose}></div>
      <div className={cn('bg-background rounded-lg shadow-xl overflow-hidden transform transition-all border-[1px] border-white')} style={{ minWidth: width }}>
        {children}
      </div>
    </div>
  )}
