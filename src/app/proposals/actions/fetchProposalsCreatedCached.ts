import { BackendEventByTopic0ResponseValue } from '@/shared/utils'

export const fetchProposalsCreatedCached = async (): Promise<{
  data: BackendEventByTopic0ResponseValue[]
}> => {
  const res = await fetch('/proposals/api')
  const data = (await res.json()) as BackendEventByTopic0ResponseValue[]
  return { data }
}
