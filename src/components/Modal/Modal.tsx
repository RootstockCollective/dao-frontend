import { FC, ReactNode } from 'react'
import { cn } from '@/lib/utils'
import { FaTimes } from 'react-icons/fa'

interface Props {
  children: ReactNode
  onClose: () => void
  width: number
}
export const Modal: FC<Props> = ({ children, onClose, width }) => {
  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 rounded-[8px]">
      <div
        className="fixed inset-0 backdrop-filter backdrop-blur-md transition-opacity"
        onClick={onClose}
      ></div>
      <div
        className={cn(
          'max-w-xl bg-background rounded-lg shadow-xl overflow-hidden transform transition-all border-[1px] border-white',
        )}
        style={{ minWidth: width }}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-white text-[24px] bg-background rounded-full p-2"
        >
          <FaTimes />
        </button>
        {children}
      </div>
    </div>
  )
}
