import { Span, Header } from '@/components/Typography'
import { Button } from '@/components/Button'
import { TbFileSearch } from 'react-icons/tb'
import { StakePreviewBalance } from './StakePreviewBalance'
import { StakePreviewBalanceProps } from '@/app/user/Stake/types'
import { ReactNode } from 'react'
import { SHARED_MODAL_BOX_SHADOW_STYLE } from '@/lib/utils'

interface StakePreviewProps {
  from: Omit<StakePreviewBalanceProps, 'topLeftText'>
  to: Omit<StakePreviewBalanceProps, 'topLeftText'>
  onConfirm: () => void
  onCancel: () => void
  actionName: string
  actionText: string | ReactNode
  confirmButtonText?: string
  confirmButtonDataTestId?: string
  customComponentBeforeFooter?: ReactNode
  disableConfirm?: boolean
  loading?: boolean
}

export const StakePreview = ({
  from,
  to,
  onConfirm,
  onCancel,
  customComponentBeforeFooter,
  disableConfirm = true,
  actionName,
  actionText,
  confirmButtonText = 'Confirm',
  confirmButtonDataTestId,
  loading = false,
}: StakePreviewProps) => {
  return (
    <div className="px-[50px] py-[20px] flex justify-center flex-col">
      <Header className="mt-[62px] text-center font-normal" fontFamily="kk-topo">
        {actionName}
      </Header>
      <Span className="text-center">{actionText}</Span>
      <div className="flex justify-center">
        <div className="bg-input-bg rounded-[6px] mt-[32px] w-full max-w-[500px]">
          <StakePreviewBalance topLeftText="From" {...from} />
          <StakePreviewBalance topLeftText="To" {...to} />
        </div>
      </div>
      <div className="my-4">{customComponentBeforeFooter}</div>
      {/* Stake Actions */}
      <div className="flex justify-center pt-4 gap-4">
        <Button variant="secondary" onClick={onCancel} buttonProps={{ 'data-testid': 'Cancel' }}>
          Cancel
        </Button>
        <Button
          onClick={onConfirm}
          disabled={disableConfirm || loading}
          loading={loading}
          buttonProps={{ 'data-testid': confirmButtonDataTestId || confirmButtonText }}
        >
          {confirmButtonText}
        </Button>
      </div>
    </div>
  )
}
