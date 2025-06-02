'use client'
import AllocationBar from '@/components/AllocationBar/AllocationBar'
import { AllocationItem } from '@/components/AllocationBar/types'

// FIXME: to be removed
export default function Wip() {
  const items: AllocationItem[] = [
    {
      key: 'boltz',
      label: 'Boltz',
      value: 50,
      color: 'bg-purple-400',
      displayColor: '#a78bfa', // Tailwind purple-400 hex
    },
    {
      key: 'wallet',
      label: '0x1D11...2D00',
      value: 10,
      color: 'bg-cyan-300',
      displayColor: '#67e8f9', // Tailwind cyan-300 hex
      isTemporary: true,
    },
    {
      key: 'abuilder',
      label: 'another builder',
      value: 10,
      color: 'bg-yellow-300',
      displayColor: '#DEFF1A', // Tailwind cyan-300 hex
    },
    {
      key: 'unallocated',
      label: 'available funds',
      value: 30,
      color: 'bg-[#25211E]',
      displayColor: '#25211E',
    },
  ]

  return (
    <>
      <AllocationBar initialItemsData={items} />
    </>
  )
}
