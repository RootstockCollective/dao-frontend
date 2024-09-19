import Image from 'next/image'

export const Logo = ({ className = '' }) => {
  return (
    <Image
      src="/images/logo.svg"
      alt="Logo"
      width={0}
      height={0}
      style={{ width: '254px', height: 'auto' }}
      className={className}
    />
  )
}
