import { useState } from 'react'
import { useScrollLock } from './useScrollLock'

export interface ModalReturn {
  isModalOpened: boolean
  toggleModal: () => void
  closeModal: () => void
  openModal: () => void
}

export const useModal = (): ModalReturn => {
  const [isModalOpened, setIsModalOpened] = useState(false)

  const toggleModal = () => setIsModalOpened(prevState => !prevState)

  const closeModal = () => setIsModalOpened(false)

  const openModal = () => setIsModalOpened(true)

  useScrollLock(isModalOpened)

  return { isModalOpened, toggleModal, closeModal, openModal }
}
