'use client'
import { useState } from 'react'
import AllocationBar, { AllocationItem } from './AllocationBar'
import PortfolioBar from './AllocationBar2'
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

  const items2 = [
    { key: 'a', label: 'BTC', color: 'bg-orange-400', displayColor: '#fb923c' },
    { key: 'b', label: 'ETH', color: 'bg-purple-400', displayColor: '#a78bfa' },
    { key: 'c', label: 'USDC', color: 'bg-cyan-300', displayColor: '#67e8f9' },
  ]

  const [allocations, setAllocations] = useState([30, 50, 20])
  const [sortedItems, setSortedItems] = useState(items2)

  return (
    <>
      <AllocationBar initialItemsData={items} />

      <PortfolioBar
        initialValues={allocations}
        initialItemsData={sortedItems}
        onChange={(vals, items) => {
          setAllocations(vals)
          setSortedItems(items)
        }}
      />
      <pre className="text-gray-300 mt-8">
        Allocations: {JSON.stringify(allocations)} {'\n'}
        Labels: {JSON.stringify(sortedItems.map(i => i.label))}
      </pre>
    </>
  )
}
