import { GridIcon, ListIcon } from '@/components/Icons'
import { motion } from 'motion/react'

interface ListSwitchProps {
  isGridMode: boolean
  setIsGridMode: (_isGridMode: boolean) => void
}

const buttonStyle = {
  border: 0,
  width: '2.25rem', // w-9
  height: '2rem', // h-8
  padding: 0,
}

export const ListSwitch = ({ isGridMode, setIsGridMode }: ListSwitchProps) => {
  return (
    <div className="flex flex-row bg-bg-100 items-center h-10 w-20 rounded-b-[18px] rounded-t-[18px] px-1">
      <motion.button
        onClick={() => setIsGridMode(false)}
        style={{
          ...buttonStyle,
          borderBottomLeftRadius: 18,
          borderTopLeftRadius: 18,
          borderTopRightRadius: 0,
          borderBottomRightRadius: 0,
        }}
        animate={{
          backgroundColor: isGridMode ? 'rgba(0,0,0,0)' : 'rgba(55, 50, 47, 1)',
        }}
        transition={{
          duration: 0.3,
        }}
        whileTap={{ scale: 0.95 }}
      >
        <motion.span
          animate={{
            color: isGridMode ? 'rgba(154, 148, 141, 1)' : 'rgba(255, 255, 255, 1)',
          }}
          transition={{
            duration: 0.3,
          }}
          className="ml-2"
          style={{ display: 'flex' }}
        >
          <ListIcon color={'currentColor'} />
        </motion.span>
      </motion.button>

      <motion.button
        onClick={() => setIsGridMode(true)}
        style={{
          ...buttonStyle,
          borderBottomRightRadius: 18,
          borderTopRightRadius: 18,
          borderTopLeftRadius: 0,
          borderBottomLeftRadius: 0,
        }}
        animate={{
          backgroundColor: isGridMode ? 'rgba(55, 50, 47, 1)' : 'rgba(0,0,0,0)',
        }}
        transition={{
          duration: 0.3,
        }}
        whileTap={{ scale: 0.95 }}
      >
        <motion.span
          animate={{
            color: isGridMode ? 'rgba(255, 255, 255, 1)' : 'rgba(154, 148, 141, 1)',
          }}
          transition={{
            duration: 0.3,
          }}
          style={{ display: 'flex' }}
        >
          <GridIcon className="ml-1" color="currentColor" />
        </motion.span>
      </motion.button>
    </div>
  )
}
