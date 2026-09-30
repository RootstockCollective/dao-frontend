import Image from 'next/image'
import { ReactNode } from 'react'

import { Span } from '@/components/Typography'

export const InfoLabel = ({ children }: { children: ReactNode }) => (
  <>
    <Image src="/images/info-icon-sm.svg" alt="" aria-hidden="true" width={20} height={20} />
    <Span variant="tag-s">{children}</Span>
  </>
)
