import { BuilderAllocationBar } from '@/app/backing/components/BuilderAllocationBar'
import { RightArrowIcon } from '@/components/Icons'
import { Span } from '@/components/TypographyNew'
import { useRouter } from 'next/navigation'

export const BackersAllocations = () => {
  const router = useRouter()
  return (
    <div className="flex flex-col pt-5 items-start gap-3 grow">
      <BuilderAllocationBar
        barOverrides={{
          height: '1rem',
          isResizable: false,
          isDraggable: false,
          className: 'px-0 py-0',
        }}
      />
      <div
        className="flex h-7 px-1 items-center gap-2 cursor-pointer"
        onClick={() => router.push('/backing')}
      >
        <Span variant="body-l" className="font-medium leading-5 text-sm">
          Backing details
        </Span>
        <RightArrowIcon />
      </div>
    </div>
  )
}
