import { cleanup, render } from '@testing-library/react'
import { describe, expect, test, afterEach } from 'vitest'
import { BackerRewardsPercentage } from './TableCells'
import { TableBody, TableCore, TableRow } from '../../../../../components/Table'
import { parseEther } from 'viem'

const renderWithTableRow = (children: React.ReactNode) => {
  return render(
    <TableCore>
      <TableBody>
        <TableRow>{children}</TableRow>
      </TableBody>
    </TableCore>,
  )
}

describe('TableCells', () => {
  afterEach(() => {
    cleanup()
  })

  describe('BackerRewardsPercentage', () => {
    const tableHeader = { label: 'Backer Rewards %', className: 'w-[10%]' }

    test('should render the current percentage', async () => {
      const backerRewardPercentage = {
        current: parseEther('1'),
        next: parseEther('1'),
        cooldownEndTime: 100n,
      }
      const { findByText, container } = renderWithTableRow(
        <BackerRewardsPercentage tableHeader={tableHeader} percentage={backerRewardPercentage} />,
      )
      const svgElement = container.querySelector('svg')

      expect(await findByText('100')).toBeVisible()
      expect(svgElement).not.toBeInTheDocument()
    })

    test('should render the negative delta percentage', async () => {
      const backerRewardPercentage = {
        current: parseEther('1'),
        next: parseEther('0.5'),
        cooldownEndTime: 100n,
      }
      const { findByText, container } = renderWithTableRow(
        <BackerRewardsPercentage tableHeader={tableHeader} percentage={backerRewardPercentage} />,
      )
      const svgElement = container.querySelector('svg')

      expect(await findByText('100')).toBeVisible()
      expect(svgElement).toBeInTheDocument()
      expect(await findByText('-50')).toBeVisible()
    })
    test('should render the positive delta percentage', async () => {
      const backerRewardPercentage = {
        current: parseEther('0.5'),
        next: parseEther('1'),
        cooldownEndTime: 100n,
      }
      const { findByText, container } = renderWithTableRow(
        <BackerRewardsPercentage tableHeader={tableHeader} percentage={backerRewardPercentage} />,
      )
      const svgElement = container.querySelector('svg')

      expect(await findByText('50')).toBeVisible()
      expect(svgElement).toBeInTheDocument()
      expect(await findByText('50')).toBeVisible()
    })
  })
})
