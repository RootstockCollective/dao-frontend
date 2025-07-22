import { type IconProps } from '@/components/Icons'

export function GridIcon({ color = 'var(--color-text-100)' }: IconProps) {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
      <path
        d="M4 11V4H11V11H4ZM4 20V13H11V20H4ZM13 11V4H20V11H13ZM13 20V13H20V20H13ZM5 10H10V5H5V10ZM14 10H19V5H14V10ZM14 19H19V14H14V19ZM5 19H10V14H5V19Z"
        fill={color}
      />
    </svg>
  )
}
