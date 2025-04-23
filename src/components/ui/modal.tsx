'use client'

import { styled } from 'next-yak'
import { KeyboardEvent, ReactNode, useEffect, useRef } from 'react'
import { X } from '@phosphor-icons/react'
import { AriaDialogProps, useDialog } from 'react-aria'
import { Property } from 'csstype'

export type ModalSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'full'

const sizeToWidth: Record<ModalSize, Property.Width> = {
  xs: '20rem',
  sm: '30rem',
  md: '36rem',
  lg: '42rem',
  xl: '48rem',
  full: '100%',
}

const sizeToMaxHeight: Record<ModalSize, Property.MaxHeight> = {
  xs: '60vh',
  sm: '65vh',
  md: '70vh',
  lg: '80vh',
  xl: '85vh',
  full: '100vh',
}

const Dialog = styled.dialog<{ $background?: string; $size: ModalSize }>`
  border: none;
  outline: none;
  position: relative;
  border-radius: 0.75rem;
  max-width: 95vw;
  transform: scale(0.5);
  transition: all 0.3s ease-in;
  animation: enter 0.2s ease-in forwards;
  background: ${({ $background = 'var(--color-white)' }) => $background};

  @keyframes enter {
    to {
      transform: scale(1);
    }
  }
`

const ModalCloseBtn = styled.button`
  background: none;
  height: fit-content;
  width: fit-content;
  justify-content: center;
  display: flex;
  align-items: center;
  transition: all 0.3s ease-in;
  position: absolute;
  top: 7px;
  right: 7px;
  cursor: pointer;
  border-radius: 0.4rem;
  padding: 0.2rem 0.3rem;
`

const ModalTitle = styled.h3`
  font-size: 1rem;
`

export interface ModalProps extends AriaDialogProps {
  title?: string
  children: ReactNode
  isOpen: boolean
  onClose: () => void
  hasCloseBtn?: boolean
  size?: ModalSize
}

export const Modal = ({
  title,
  isOpen,
  onClose,
  hasCloseBtn,
  children,
  size = 'sm',
  ...props
}: ModalProps) => {
  const modalRef = useRef<HTMLDialogElement>(null)
  const { dialogProps, titleProps } = useDialog(props, modalRef)

  const dialogStyle = {
    width: sizeToWidth[size],
    maxHeight: sizeToMaxHeight[size],
  }

  useEffect(() => {
    const modalElement = modalRef.current
    if (!modalElement) return

    if (isOpen) {
      modalElement.showModal()
    } else {
      modalElement.close()
    }
  }, [isOpen])

  const handleOnClose = () => {
    if (onClose) onClose()
  }

  const handleKeyDown = (event: KeyboardEvent<HTMLDialogElement>) => {
    if (event.key === 'Escape') {
      event.preventDefault()
      handleOnClose()
    }
  }

  const handleBackdropClick = (event: React.MouseEvent<HTMLDialogElement>) => {
    if (event.target === modalRef.current) {
      handleOnClose()
    }
  }

  return (
    <Dialog
      ref={modalRef}
      onKeyDown={handleKeyDown}
      onClick={handleBackdropClick}
      $size={size}
      style={dialogStyle}
      {...dialogProps}
    >
      {title && <ModalTitle {...titleProps}>{title}</ModalTitle>}
      {hasCloseBtn && (
        <ModalCloseBtn aria-label="Close modal" onClick={handleOnClose}>
          <X size={18} color="var(--color-gray-medium)" />
        </ModalCloseBtn>
      )}
      {children}
    </Dialog>
  )
}
