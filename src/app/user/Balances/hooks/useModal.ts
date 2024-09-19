import { useState } from 'react'

export const useModal = () => {
  const [isModalOpened, setIsModalOpened] = useState(false)

  const toggleModal = () => setIsModalOpened(prevState => !prevState)

  const closeModal = () => setIsModalOpened(false)

  const openModal = () => setIsModalOpened(true)

  return { isModalOpened, toggleModal, closeModal, openModal }
}
