import { useGetActiveBuildersCount } from '@/app/collective-rewards/shared/hooks/useGetActiveBuildersCount'
import { useHandleErrors } from '@/app/collective-rewards/utils'
import { LoadingSpinner } from '@/components/LoadingSpinner'
import { Metric } from '@/components/Metric'
import { Header } from '@/components/Typography'

export const ActiveBuilders = () => {
  const { data, isLoading, error } = useGetActiveBuildersCount()
  useHandleErrors({ error, title: 'Error loading active builders' })
  if (isLoading) return <LoadingSpinner size="medium" />
  const count = data?.count ?? 0
  const isClickable = count > 0
  const scrollToTable = () =>
    document.getElementById('builders-table')?.scrollIntoView({ behavior: 'smooth' })
  return (
    <Metric title="Total active Builders">
      <Header
        bold
        className={`text-xl md:text-[2rem] ${isClickable ? 'cursor-pointer hover:underline' : ''}`}
        onClick={isClickable ? scrollToTable : undefined}
      >
        {count}
      </Header>
    </Metric>
  )
}
