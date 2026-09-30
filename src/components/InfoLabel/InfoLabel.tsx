import Image from 'next/image'
import { ReactNode } from 'react'

import { Span } from '@/components/Typography'

/** The "(i) text" label of modal footers: "Help, I don't understand", "How the boost works". */
export const InfoLabel = ({ children }: { children: ReactNode }) => (
  <>
    <Image src="/images/info-icon-sm.svg" alt="" aria-hidden="true" width={20} height={20} />
    <Span variant="tag-s">{children}</Span>
  </>
)
