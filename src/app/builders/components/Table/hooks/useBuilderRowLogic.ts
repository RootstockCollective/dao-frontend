import { useState } from 'react'
import { useAccount } from 'wagmi'
import { useTableActionsContext, useTableContext } from '@/shared/context'
import { useAppKitFlow } from '@/shared/walletConnection/connection/useAppKitFlow'
import { getBuilderInactiveState, isBuilderInProgress } from '@/app/collective-rewards/utils'
import { BuilderCellDataMap, ColumnId } from '../BuilderTable.config'
import { BuilderTable } from '../BuilderTable.config'

interface UseBuilderRowLogicProps {
  row: BuilderTable['Row']
  userBacking: bigint
}

export const useBuilderRowLogic = ({ row, userBacking }: UseBuilderRowLogicProps) => {
  const { id: rowId, data } = row
  const { builder } = data as BuilderCellDataMap

  const { selectedRows } = useTableContext<ColumnId, BuilderCellDataMap>()
  const { isConnected } = useAccount()
  const { intermediateStep, handleConnectWallet, handleCloseIntermediateStep, onConnectWalletButtonClick } =
    useAppKitFlow()

  const [isHovered, setIsHovered] = useState(false)
  const [isExpanded, setIsExpanded] = useState(false)
  const dispatch = useTableActionsContext<ColumnId, BuilderCellDataMap>()

  // Computed values
  const hasSelections = Object.values(selectedRows).some(Boolean)
  const isInProgress = isBuilderInProgress(builder.builder)
  const inactiveState = getBuilderInactiveState(builder.builder)
  const hasInactiveState = inactiveState !== null
  const hasBacking = userBacking > 0n
  const canBack = !isInProgress && (!hasInactiveState || hasBacking)
  const isRowSelected = selectedRows[rowId]

  // Event handlers
  const handleToggleSelection = () => {
    if (!isConnected || !canBack) {
      return
    }

    dispatch({
      type: 'TOGGLE_ROW_SELECTION',
      payload: rowId,
    })
  }

  const handleToggleExpand = () => {
    setIsExpanded(!isExpanded)
  }

  const handleMouseEnter = () => {
    if (canBack) setIsHovered(true)
  }

  const handleMouseLeave = () => {
    setIsHovered(false)
  }

  return {
    // State
    isHovered,
    isExpanded,
    setIsHovered,
    setIsExpanded,

    // Computed values
    rowId,
    data,
    hasSelections,
    isInProgress,
    inactiveState,
    hasInactiveState,
    hasBacking,
    canBack,
    isRowSelected,
    isConnected,

    // Event handlers
    handleToggleSelection,
    handleToggleExpand,
    handleMouseEnter,
    handleMouseLeave,

    // Wallet flow
    intermediateStep,
    handleConnectWallet,
    handleCloseIntermediateStep,
    onConnectWalletButtonClick,
  }
}
