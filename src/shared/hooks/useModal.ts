import { useState } from 'react'

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

  return { isModalOpened, toggleModal, closeModal, openModal }
}
