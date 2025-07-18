import { DEFAULT_ICON_SIZE } from '@/components/Icons/constants'
import { type IconProps } from '@/components/Icons'
import { cn } from '@/lib/utils'

export default function InfoIcon({ size = DEFAULT_ICON_SIZE, className, ...props }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      className={cn(className, 'shrink-0')}
      {...props}
    >
      <path
        d="M11.5 9.5C12.0523 9.5 12.5 9.05228 12.5 8.5C12.5 7.94772 12.0523 7.5 11.5 7.5C10.9477 7.5 10.5 7.94772 10.5 8.5C10.5 9.05228 10.9477 9.5 11.5 9.5Z"
        fill="#ACA39D"
      />
      <path
        d="M12 20C16.4183 20 20 16.4183 20 12C20 7.58172 16.4183 4 12 4C7.58172 4 4 7.58172 4 12C4 16.4183 7.58172 20 12 20Z"
        stroke="#ACA39D"
        strokeWidth="1.25"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M11.25 11.625C11.4489 11.625 11.6397 11.704 11.7803 11.8447C11.921 11.9853 12 12.1761 12 12.375V15.75C12 15.9489 12.079 16.1397 12.2197 16.2803C12.3603 16.421 12.5511 16.5 12.75 16.5"
        stroke="#ACA39D"
        strokeWidth="1.25"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}
