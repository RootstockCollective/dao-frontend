import { FC } from 'react'
import { Popover, PopoverProps } from '../../../../components/Popover'
import { Button, ButtonProps } from '../../../../components/Button'

const TooltipSvg = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
    <g clipPath="url(#clip0_8594_68155)">
      <path
        d="M7.57508 7.49984C7.771 6.94289 8.15771 6.47326 8.66671 6.17411C9.17571 5.87497 9.77416 5.76562 10.3561 5.86543C10.938 5.96524 11.4658 6.26777 11.846 6.71944C12.2262 7.17111 12.4343 7.74277 12.4334 8.33317C12.4334 9.99984 9.93342 10.8332 9.93342 10.8332M10.0001 14.1665H10.0084M18.3334 9.99984C18.3334 14.6022 14.6025 18.3332 10.0001 18.3332C5.39771 18.3332 1.66675 14.6022 1.66675 9.99984C1.66675 5.39746 5.39771 1.6665 10.0001 1.6665C14.6025 1.6665 18.3334 5.39746 18.3334 9.99984Z"
        stroke="white"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </g>
    <defs>
      <clipPath id="clip0_8594_68155">
        <rect width="20" height="20" fill="white" />
      </clipPath>
    </defs>
  </svg>
)

export type TooltipProps = {
  text: string
  popoverProps?: Pick<PopoverProps, 'size' | 'position'>
}

export const Tooltip: FC<TooltipProps> = ({ text, popoverProps }) => (
  <>
    <Popover
      content={
        <div className="text-[12px] font-bold mb-1">
          <p data-testid="tooltip">{text}</p>
        </div>
      }
      trigger="hover"
      position="top"
      size="small"
      {...popoverProps}
    >
      <Button variant="borderless" className="px-1 py-1">
        <TooltipSvg />
      </Button>
    </Popover>
  </>
)
