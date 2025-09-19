import { Paragraph } from '@/components/Typography'

export const SelectBuildersTooltipContent = () => {
  return (
    <div className="flex justify-center">
      <div className="bg-v3-text-80 rounded-sm shadow-sm w-64 flex flex-col items-start p-6 gap-2">
        <Paragraph className="text-v3-bg-accent-100 text-sm w-full font-normal leading-5 rootstock-sans self-stretch">
          Select Builders you want to back
        </Paragraph>
      </div>
    </div>
  )
}

export const NonHoverableBuilderTooltipContent = () => {
  return (
    <div className="flex justify-center">
      <div className="bg-v3-text-80 rounded-sm shadow-sm w-64 flex flex-col items-start p-6 gap-2">
        <Paragraph className="text-v3-bg-accent-100 text-sm w-full font-normal leading-5 rootstock-sans self-stretch">
          This Builder state does not allow backing
        </Paragraph>
      </div>
    </div>
  )
}
