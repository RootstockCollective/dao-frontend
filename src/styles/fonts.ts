import localFont from '@next/font/local'
import { Open_Sans } from 'next/font/google'

export const openSans = Open_Sans({
  variable: '--font-open-sans',
  subsets: ['latin'],
})

export const kkTopo = localFont({
  src: '../../public/fonts/KK-Topo-Regular.otf',
  variable: '--font-kk-topo',
})
