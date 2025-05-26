import { envFlags } from '@/shared/context/flags'
import { redirect } from 'next/navigation'
import { BackingPage } from './BackingPage'

export default function Backing() {
  const { v3_design } = envFlags

  if (!v3_design) {
    redirect('/')
  }

  return v3_design && <BackingPage />
}
