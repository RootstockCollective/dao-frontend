import { cn } from '@/lib/utils'

export const Logo = ({ className = '', textClassName = '' }) => {
  return (
    <div className={className}>
      <h1 className={cn('text-2xl font-bold', textClassName)}>
        Rootstock
        <span className="text-primary">Collective</span>
      </h1>
    </div>
  )
}
