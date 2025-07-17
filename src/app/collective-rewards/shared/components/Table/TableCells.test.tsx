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
    test('should render the current percentage with no delta percentage since current and next are the same', async () => {
      const backerRewardPercentage = {
        previous: parseEther('0.1'),
        current: parseEther('0.1'),
        next: parseEther('0.1'),
        cooldownEndTime: 100n,
      }
      const { findByText, container } = renderWithTableRow(
        <BackerRewardsPercentage className="w-[10%]" percentage={backerRewardPercentage} />,
      )
      const svgElement = container.querySelector('svg')
      const upArrowClass = container.querySelector('.fa-arrow-up')
      const downArrowClass = container.querySelector('.fa-arrow-down')

      expect(await findByText('10')).toBeVisible()
      expect(svgElement).not.toBeInTheDocument()
      expect(upArrowClass).not.toBeInTheDocument()
      expect(downArrowClass).not.toBeInTheDocument()
    })

    test('should render the negative delta percentage', async () => {
      const backerRewardPercentage = {
        previous: parseEther('0.9'),
        current: parseEther('.9'),
        next: parseEther('0.1'),
        cooldownEndTime: 100n,
      }
      const { findByText, container } = renderWithTableRow(
        <BackerRewardsPercentage className="w-[10%]" percentage={backerRewardPercentage} />,
      )
      const svgElement = container.querySelector('svg')
      const upArrowClass = container.querySelector('.fa-arrow-up')
      const downArrowClass = container.querySelector('.fa-arrow-down')

      expect(await findByText('90')).toBeVisible()
      expect(svgElement).toBeInTheDocument()
      expect(upArrowClass).not.toBeInTheDocument()
      expect(downArrowClass).toBeInTheDocument()
      expect(await findByText('-80')).toBeVisible()
    })
    test('should render the positive delta percentage', async () => {
      const backerRewardPercentage = {
        previous: parseEther('0.2'),
        current: parseEther('0.2'),
        next: parseEther('.8'),
        cooldownEndTime: 100n,
      }
      const { findByText, container } = renderWithTableRow(
        <BackerRewardsPercentage className="w-[10%]" percentage={backerRewardPercentage} />,
      )
      const svgElement = container.querySelector('svg')
      const upArrowClass = container.querySelector('.fa-arrow-up')
      const downArrowClass = container.querySelector('.fa-arrow-down')

      expect(await findByText('20')).toBeVisible()
      expect(svgElement).toBeInTheDocument()
      expect(upArrowClass).toBeInTheDocument()
      expect(downArrowClass).not.toBeInTheDocument()
      expect(await findByText('+60')).toBeVisible()
    })
  })
})
