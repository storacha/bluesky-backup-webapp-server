import { useCallback, useState } from 'react'

/**
 * A custom hook to help us handle modal/dialog open, close, toggle states
 * @param {boolean} initialState - the initial open or close state for the modal. it is `false` by default.
 */
export const useDisclosure = (initialState: boolean = false) => {
  const [isOpen, setIsOpen] = useState<boolean>(initialState)

  const onOpen = useCallback(() => {
    setIsOpen(true)
  }, [])

  const onClose = useCallback(() => {
    setIsOpen(false)
  }, [])

  const onToggle = useCallback(() => {
    setIsOpen((prev) => !prev)
  }, [])

  return {
    isOpen,
    onOpen,
    onClose,
    onToggle,
  }
}
