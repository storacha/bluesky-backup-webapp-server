import { UiComponents, useUiComponentStore } from '@/store/ui'
import { useCallback, useState } from 'react'

/**
 * A custom hook to help us handle modal/dialog open, close, toggle states
 * @param {boolean} initialState - the initial open or close state for the modal. it is `false` by default.
 */

export type DisclosureParams = {
  component?: UiComponents
}
export const useDisclosure = (params: DisclosureParams = {}) => {
  const [isOpen, setIsOpen] = useState<boolean>(false)
  const { updateUiStore } = useUiComponentStore()

  const onOpen = useCallback(() => {
    setIsOpen(true)
    if (params?.component) {
      updateUiStore({ ui: params?.component })
    }
  }, [params?.component, updateUiStore])

  const onClose = useCallback(() => {
    setIsOpen(false)
    if (params?.component) {
      updateUiStore({ ui: '' })
    }
  }, [params?.component, updateUiStore])

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
