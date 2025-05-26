import AllocationBar, { AllocationItem } from './AllocationBar'
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
      key: 'unallocated',
      label: 'another builder',
      value: 10,
      color: 'bg-yellow-300',
      displayColor: '#DEFF1A', // Tailwind cyan-300 hex
    },
  ]

  return (
    <>
      <AllocationBar itemsData={items} />
    </>
  )
}
