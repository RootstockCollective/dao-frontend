import { cn } from '@/lib/utils'

export function CardButton({ className, ...props }: React.HTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      className={cn(
        'px-4 py-3 font-rootstock-sans rounded-sm font-bold text-bg-100 cursor-pointer inline-flex items-center justify-center text-sm sm:text-base',
        className,
      )}
      {...props}
    />
  )
}
