import { ComponentType, FC, useEffect, useState } from 'react'
import { CopySvg } from '@/components/CopySvg'
import { ADDRESS_ANIMATION_DURATION } from '@/lib/constants'
import { shortAddress } from '../../lib/utils'
import { Address, isAddress } from 'viem'

type WithCopyProps = {
  clipboard: string
}

type CopyStatus = 'success' | 'error'

export const withCopy = <P extends {}>(Component: ComponentType<P>): FC<P & WithCopyProps> => {
  const WrappedComponent = ({ clipboard, ...props }: WithCopyProps) => {
    const [animationShown, setAnimationShown] = useState(false)
    const [copied, setCopied] = useState('success' as CopyStatus)
    const onClick = async () => {
      if (animationShown) {
        return
      }

      try {
        await navigator.clipboard.writeText(clipboard)
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
    const copyButtonClass = `px-2 hover:cursor-pointer ${animationShown ? 'animate-translate-x' : ''}`
    const feedbackClass = `text-sm ${feedback.color} animate-fade-in-slide-in`
    const animationClass = `${animationShown ? 'animate-fade-out-slide-out' : 'hidden'}`

    return (
      <span className="flex items-center">
        <Component {...(props as P)} />
        <span className={animationClass}>
          {isAddress(clipboard) ? shortAddress(clipboard as Address) : clipboard}
        </span>
        <span className={copyButtonClass} onClick={onClick}>
          <CopySvg color={copyColor} />
        </span>
        {animationShown && <span className={feedbackClass}>{feedback.text}</span>}
      </span>
    )
  }

  WrappedComponent.displayName = `WithSpinner(${Component.displayName || Component.name})`

  return WrappedComponent
}
