import { useEffect, useState } from 'react'
import { isAddress } from 'viem'
import { Span } from '@/components/Typography'
import { CopySvg } from '@/components/CopySvg'
import { ADDRESS_ANIMATION_DURATION } from '@/lib/constants'

export interface AddressProps {
  addressOrAlias: string
}

type CopyStatus = 'success' | 'error'

export const AddressOrAlias: React.FC<AddressProps> = ({ addressOrAlias }) => {
  const [animationShown, setAnimationShown] = useState(false)
  const [copied, setCopied] = useState('success' as CopyStatus)
  const onClick = async () => {
    if (animationShown) {
      return
    }

    try {
      await navigator.clipboard.writeText(addressOrAlias)
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
  const addressClass = `font-normal text-base leading-none text-text-primary ${animationShown ? 'animate-fade-out-slide-out' : ''}`
  const aliasClass = `text-sm line-clamp-1 ${animationShown ? 'animate-fade-out-slide-out' : ''}`
  const copyButtonClass = `px-2 hover:cursor-pointer ${animationShown ? 'animate-translate-x' : ''}`
  const feedbackClass = `text-sm ${feedback.color} animate-fade-in-slide-in`

  return (
    <span className="flex items-center">
      {isAddress(addressOrAlias) ? (
        <Span className={addressClass}>
          {addressOrAlias.substring(0, 6)}...{addressOrAlias.substring(addressOrAlias.length - 4)}
        </Span>
      ) : (
        <Span className={aliasClass}>{addressOrAlias}</Span>
      )}

      <span className={copyButtonClass} onClick={onClick}>
        <CopySvg color={copyColor} />
      </span>
      {animationShown && <span className={feedbackClass}>{feedback.text}</span>}
    </span>
  )
}
