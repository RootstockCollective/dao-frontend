import { Paragraph } from '@/components/TypographyNew'
import { RocketIconKoto } from '@/components/Icons'
import { HTMLAttributes, ReactNode } from 'react'
import { cn } from '@/lib/utils'

interface Props extends HTMLAttributes<HTMLDivElement> {
  text: ReactNode
}

/**
 * BoostedLabelKoto component is used to display a label with a rocket icon and text.
 * It should be used in communities to indicate a boosted status.
 * @param text
 * @constructor
 */
export const BoostedLabelKoto = ({ text, className, ...props }: Props) => {
  return (
    <div
      className={cn(
        'rounded-full text-bg-100 flex gap-2 uppercase py-1 pl-1 pr-3 items-center font-[500]',
        className,
      )}
      style={{
        background: 'linear-gradient(270deg, #FFFEE3 0%, #F5CCFF 30%, #F7931A 72.5%, #932309 100%)',
      }}
      {...props}
    >
      <RocketIconKoto color="white" stroke="white" className="bg-black rounded-full p-1" size={24} />
      {typeof text === 'string' ? <Paragraph>{text}</Paragraph> : <div>{text}</div>}
    </div>
  )
}
