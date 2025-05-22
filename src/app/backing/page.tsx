import { ActionsContainer } from './components/Container'
import { InfoContainer } from './components/Container/InfoContainer'
import { MetricsContainer } from './components/Container/MetricsContainer'
import { PageTitleContainer } from './components/Container/PageTitleContainer'

const NAME = 'Backing'
export default function Backing() {
  // const { address } = useAccount()
  const address = true
  return (
    <div
      data-testid={NAME}
      className="flex flex-col items-start w-full h-full pt-[0.13rem] gap-10 rounded-sm"
    >
      <PageTitleContainer left={NAME} dataTestid={NAME} />
      <div data-testid={`${NAME}_info`} className="flex items-center justify-center rounded-sm">
        <InfoContainer dataTestid={NAME} />
        <MetricsContainer dataTestid={NAME} />
      </div>

      {address && (
        <div
          data-testid="Backers_ActionsMetrics"
          className="flex flex-col w-[71.5rem] items-start gap-2 p-6 rounded-sm "
        >
          Hey what are you
          {/* <div className=""></div> */}
        </div>
      )}
      <ActionsContainer dataTestid={NAME} />
    </div>
  )
}
