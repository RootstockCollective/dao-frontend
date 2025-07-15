import { Paragraph } from '@/components/TypographyNew'
import { RocketIconKoto } from '@/components/Icons'

interface Props {
  text: string
}

/**
 * BoostedLabelKoto component is used to display a label with a rocket icon and text.
 * It should be used in communities to indicate a boosted status.
 * @param text
 * @constructor
 */
export const BoostedLabelKoto = ({ text }: Props) => {
  return (
    <div
      className="rounded-full text-bg-100 flex gap-2 uppercase py-1 pl-1 pr-3 items-center font-[500]"
      style={{
        background: 'linear-gradient(270deg, #FFFEE3 0%, #F5CCFF 30%, #F7931A 72.5%, #932309 100%)',
      }}
    >
      <RocketIconKoto color="white" stroke="white" className="bg-black rounded-full p-1" size={24} />
      <Paragraph>{text}</Paragraph>
    </div>
  )
}
