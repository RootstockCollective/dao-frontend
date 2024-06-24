import jdenticon from 'jdenticon/standalone'
import { useEffect, useRef } from 'react'

export const Jdenticon = ({ value = 'test', size = '100%' }) => {
  const icon = useRef(null)
  useEffect(() => {
    if (icon.current) {
      jdenticon.update(icon.current, value)
    }
  }, [value])
  return (
    <>
      <svg data-jdenticon-value={value} height={size} ref={icon} width={size} />
    </>
  )
}
