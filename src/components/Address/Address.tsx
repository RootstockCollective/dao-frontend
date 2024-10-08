import { ADDRESS_ANIMATION_DURATION } from '@/lib/constants'
import { useEffect, useState } from 'react'
import { Span } from '@/components/Typography'
import { isAddress } from 'viem'

export interface AddressProps {
  address: string
}

const CopySvg = ({ color = 'white' }) => {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
      <g clipPath="url(#clip0_4759_1391)">
        <path
          d="M5.33334 5.33301V3.46634C5.33334 2.7196 5.33334 2.34624 5.47867 2.06102C5.6065 1.81014 5.81047 1.60616 6.06136 1.47833C6.34657 1.33301 6.71994 1.33301 7.46668 1.33301H12.5333C13.2801 1.33301 13.6534 1.33301 13.9387 1.47833C14.1895 1.60616 14.3935 1.81014 14.5214 2.06102C14.6667 2.34624 14.6667 2.7196 14.6667 3.46634V8.53301C14.6667 9.27974 14.6667 9.65311 14.5214 9.93833C14.3935 10.1892 14.1895 10.3932 13.9387 10.521C13.6534 10.6663 13.2801 10.6663 12.5333 10.6663H10.6667M3.46668 14.6663H8.53334C9.28008 14.6663 9.65345 14.6663 9.93866 14.521C10.1895 14.3932 10.3935 14.1892 10.5214 13.9383C10.6667 13.6531 10.6667 13.2797 10.6667 12.533V7.46634C10.6667 6.7196 10.6667 6.34624 10.5214 6.06102C10.3935 5.81014 10.1895 5.60616 9.93866 5.47833C9.65345 5.33301 9.28008 5.33301 8.53334 5.33301H3.46668C2.71994 5.33301 2.34657 5.33301 2.06136 5.47833C1.81047 5.60616 1.6065 5.81014 1.47867 6.06102C1.33334 6.34624 1.33334 6.7196 1.33334 7.46634V12.533C1.33334 13.2797 1.33334 13.6531 1.47867 13.9383C1.6065 14.1892 1.81047 14.3932 2.06136 14.521C2.34657 14.6663 2.71994 14.6663 3.46668 14.6663Z"
          stroke={color}
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </g>
      <defs>
        <clipPath id="clip0_4759_1391">
          <rect width="16" height="16" fill={color} />
        </clipPath>
      </defs>
    </svg>
  )
}

type CopyStatus = 'success' | 'error'

export const Address: React.FC<AddressProps> = ({ address }) => {
  const [animationShown, setAnimationShown] = useState(false)
  const [copied, setCopied] = useState('success' as CopyStatus)
  const onClick = async () => {
    if (animationShown) {
      return
    }

    try {
      await navigator.clipboard.writeText(address)
      setCopied('success')
    } catch (error) {
      console.error(error instanceof Error ? error.message : 'Cannot copy contents to the clipboard')
      setCopied('error')
    } finally {
      setAnimationShown(true)
    }
  }

  useEffect(() => {
    if (!animationShown) return
    const timeout = setTimeout(() => {
      setAnimationShown(false)
    }, ADDRESS_ANIMATION_DURATION)
    return () => clearTimeout(timeout)
  }, [animationShown])

  const feedback = {
    success: { color: 'text-[#22AD5C]', text: 'Copied!' },
    error: { color: 'text-[#FF0000]', text: 'Error!' },
  }[copied]

  const copyColorValue = {
    success: '#22AD5C',
    error: '#FF0000',
  }[copied]

  const copyColor = animationShown ? copyColorValue : 'white'
  const addressClass = `text-sm ${animationShown ? 'animate-fade-out-slide-out' : ''}`
  const aliasClass = `text-sm line-clamp-1 ${animationShown ? 'animate-fade-out-slide-out' : ''}`
  const copyButtonClass = `px-2 hover:cursor-pointer ${animationShown ? 'animate-translate-x' : ''}`
  const feedbackClass = `text-sm ${feedback.color} animate-fade-in-slide-in`

  return (
    <span className="flex items-center">
      {isAddress(address) ? (
        <Span className={addressClass}>
          {address.substring(0, 6)}...{address.substring(address.length - 4)}
        </Span>
      ) : (
        <Span className={aliasClass}>{address}</Span>
      )}

      <span className={copyButtonClass} onClick={onClick}>
        <CopySvg color={copyColor} />
      </span>
      {animationShown && <span className={feedbackClass}>{feedback.text}</span>}
    </span>
  )
}
