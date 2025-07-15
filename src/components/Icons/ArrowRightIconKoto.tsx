import { type IconProps } from './types'

export function ArrowRightIconKoto({
  'aria-label': ariaLabel = 'Arrow Right Icon',
  size = 20,
  color = 'var(--color-text-100)',
  stroke = color,
  strokeWidth = '1.25',
  ...props
}: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 20 20" fill="none" {...props}>
      <path
        d="M14.2323 10.4166H4.16666V9.58329H14.2323L9.40541 4.75642L9.99999 4.16663L15.8333 9.99996L9.99999 15.8333L9.40541 15.2435L14.2323 10.4166Z"
        fill={color}
      />
    </svg>
  )
}
