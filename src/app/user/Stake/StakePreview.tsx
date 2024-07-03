import { Header, Paragraph } from '@/components/Typography'
import { Button } from '@/components/Button'
import { TbFileSearch } from 'react-icons/tb'
import { StakePreviewBalance } from './StakePreviewBalance'
import { StakePreviewBalanceProps } from '@/app/user/Stake/types'

interface StakePreviewProps {
  from: Omit<StakePreviewBalanceProps, 'topLeftText'>
  to: Omit<StakePreviewBalanceProps, 'topLeftText'>
  onConfirm: () => void
  onCancel: () => void
}

export const StakePreview = ({
  from,
  to,
  onConfirm,
  onCancel,
}: StakePreviewProps) => {
  
  return (
    <div className='px-[50px] py-[20px] flex justify-center flex-col'>
      <div className='flex justify-center mt-[63px]'>
        <div
          style={{
            boxShadow: '0px 0px 16.4px 0px rgba(123,87,252,0.68)',
            padding: 17,
            borderRadius: '30%',
            backgroundColor: 'white',
            width: 80
          }}
        >
          <TbFileSearch
            size={48}
            color='#665EF6'
          />
        </div>
      </div>
      <Header className='mt-[62px] text-center'>Stake Preview</Header> {/* @TODO make "stake" dynamic (stake, unstake) */}
      <Paragraph
        className='text-center'
        variant='light'
      >Preview your stake and make sure everything is correct!</Paragraph> {/* @TODO make "stake" dynamic (stake, unstake) */}
      {/* Preview box */}
      <div className='flex justify-center'>
        <div className='bg-input-bg rounded-[6px] mt-[32px] w-full max-w-[500px]'>
          <StakePreviewBalance  topLeftText='From' {...from}
          />
          <StakePreviewBalance topLeftText='To' {...to} />
        </div>
      </div>
      {/* Stake Actions */}
      <div className='flex justify-center pt-10 gap-4'>
        <Button variant='secondary' onClick={onCancel}>Cancel</Button>
        <Button onClick={onConfirm}>Confirm</Button>
      </div>
    </div>
  )
}
