import Image from 'next/image'

export const HeaderText = () => (
  <Image
    src="/images/wordmark.svg"
    alt="Logo"
    width={0}
    height={0}
    className="absolute top-9 left-8 w-[96px] h-auto"
  />
)
