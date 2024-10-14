import Image from 'next/image'

export const HeaderText = () => (
  <header className="absolute top-9 left-8">
    <Image
      src="/images/wordmark.svg"
      alt="Logo"
      width={0}
      height={0}
      style={{ width: '96px', height: 'auto' }}
    />
  </header>
)
