import { CommonComponentProps } from '@/components/commonProps'
import { Tooltip, TooltipProps } from '@/components/Tooltip'
import { Label, LabelProps } from '@/components/Typography'
import { USD } from '@/lib/constants'
import { cn } from '@/lib/utils'

export type FiatTooltipLabelProps = CommonComponentProps & {
  tooltip: TooltipProps
  label?: Partial<LabelProps>
}

export const FiatTooltipLabel = ({ tooltip: tooltipProps, label }: FiatTooltipLabelProps) => {
  const { className: labelClassName, style: labelStyle, ...labelProps } = label || {}
  return (
    <Tooltip {...tooltipProps}>
      <Label
        variant="body-s"
        className={cn('font-medium leading-[145%]', labelClassName)}
        style={{
          textDecorationLine: 'underline',
          textDecorationStyle: 'dotted',
          textDecorationSkipInk: 'none',
          textDecorationThickness: '8%',
          textUnderlineOffset: '24%',
          textUnderlinePosition: 'from-font',
          ...labelStyle,
        }}
        {...labelProps}
      >
        {USD}
      </Label>
    </Tooltip>
  )
}
