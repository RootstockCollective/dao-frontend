'use client'

import { FC } from 'react'
import { useIsDesktop } from '@/shared/hooks/useIsDesktop'
import { CommonComponentProps } from '@/components/commonProps'
import { BuilderTable } from './BuilderTable.config'
import { DesktopBuilderRow } from './components/DesktopBuilderRow'
import { MobileBuilderRow } from './components/MobileBuilderRow'

// Re-export utilities for backward compatibility
export { convertDataToRowData, selectedRowStyle, unselectedRowStyle } from './utils/builderRowUtils'

interface BuilderDataRowProps extends CommonComponentProps<HTMLTableRowElement> {
  row: BuilderTable['Row']
  userBacking: bigint
}

/**
 * Main container component that renders either desktop or mobile builder row
 * based on screen size. This component delegates rendering to specialized
 * row components while maintaining the same external API.
 */
export const BuilderDataRow: FC<BuilderDataRowProps> = ({ row, userBacking, ...props }) => {
  const isDesktop = useIsDesktop()

  return isDesktop ? (
    <DesktopBuilderRow row={row} userBacking={userBacking} {...props} />
  ) : (
    <MobileBuilderRow row={row} userBacking={userBacking} {...props} />
  )
}
