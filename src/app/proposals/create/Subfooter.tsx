import { Button } from '@/components/ButtonNew'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

export const Subfooter = ({ href }: { href: string }) => {
  const router = useRouter()
  return (
    <div className="h-[96px] w-full flex items-center justify-center gap-2 bg-bg-60">
      <Button onClick={router.back} variant="secondary-outline">
        Back
      </Button>
      <Link href={href}>
        <Button>Review proposal</Button>
      </Link>
    </div>
  )
}
