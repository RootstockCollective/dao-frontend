import { cn } from '@/lib/utils/utils'
import { Typography, TypographyProps } from '@/components/Typography/Typography'

const DEFAULT_CLASSES = 'text-white text-[24px] font-normal uppercase'

export const HeaderTitle = ({ className, children, ...props }: Omit<TypographyProps, 'tagVariant'>) => (
  <Typography tagVariant="h1" className={cn(DEFAULT_CLASSES, className)} fontFamily="kk-topo" {...props}>
    {children}
  </Typography>
)
