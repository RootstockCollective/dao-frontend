import { Paragraph } from '@/components/Typography/Paragraph'
import { Link } from '@/components/Link'

export const UsefulLinks = () => (
  <div>
    <Paragraph className='mb-[24px] text-[16px]'>Useful links</Paragraph>
    <Link href='#' variant='menu' className='mb-[16px] text-[16px]'>Register RNS Domain</Link>
    <Link href='#' variant='menu' className='mb-[16px] text-[16px]'>Token Bridge Dapp</Link>
    <Link href='#' variant='menu' className='mb-[16px] text-[16px]'>Flyover Dapp</Link>
    <Link href='#' variant='menu' className='mb-[16px] text-[16px]'>Read more about RIF</Link>
  </div>
)
