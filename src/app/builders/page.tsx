import { envFlags } from '@/shared/context/flags'
import { redirect } from 'next/navigation'
import { BuildersPage } from './BuildersPage'

export default function Builders() {
  const { v3_design } = envFlags

  if (!v3_design) {
    redirect('/')
  }

  return v3_design && <BuildersPage />
}
