import { useCallback, useState } from 'react'
import { useScrollLock } from './useScrollLock'

interface ModalReturn {
  isModalOpened: boolean
  toggleModal: () => void
  closeModal: () => void
  openModal: () => void
}

export const useModal = (): ModalReturn => {
  const [isModalOpened, setIsModalOpened] = useState(false)

  const toggleModal = useCallback(() => setIsModalOpened(prevState => !prevState), [])

  const closeModal = useCallback(() => setIsModalOpened(false), [])

  const openModal = useCallback(() => setIsModalOpened(true), [])

  useScrollLock(isModalOpened)

  return { isModalOpened, toggleModal, closeModal, openModal }
}
