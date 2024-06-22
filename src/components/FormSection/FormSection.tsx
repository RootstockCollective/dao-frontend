import { FC, ReactNode, useState } from 'react'
import { Header } from '@/components/Typography/Header'
import { CiCircleMinus, CiCirclePlus } from 'react-icons/ci'

interface Props {
  header: string
  content: ReactNode
  isExpanded?: boolean
}
export const FormSection: FC<Props> = ({ header, isExpanded = false, content }) => {
  const [expanded, setExpanded] = useState(isExpanded)
  
  const handleToggleExpanded = () => setExpanded((prevState) => !prevState)
  
  const IconToRender = expanded ? CiCircleMinus : CiCirclePlus
  
  return (
    <div data-testid='FormSection'>
      {/* Title and Right icon */}
      <div className='flex justify-between items-center'>
        <Header>{header}</Header>
        {/* ICON HERE */}
        <span onClick={handleToggleExpanded} data-testid='ExpandIcon'>
          <IconToRender size='28px' />
        </span>
      </div>
      {/* content that will depend on isExpanded */}
      {expanded && content}
    </div>
  )
}
