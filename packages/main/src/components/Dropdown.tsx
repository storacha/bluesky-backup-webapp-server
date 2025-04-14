'use client'

import { Fragment } from 'react'
import { Menu, Transition } from '@headlessui/react'
import { ChevronDownIcon } from '@heroicons/react/20/solid'

export interface DropdownItem {
  label: string
  onClick?: () => void
  icon?: React.ReactNode
  disabled?: boolean
}

export interface DropdownProps {
  trigger?: React.ReactNode
  items: DropdownItem[]
  className?: string
  align?: 'left' | 'center' | 'right'
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost'
  children?: React.ReactNode
}

export default function Dropdown({
  trigger,
  items,
  className = '',
  align = 'right',
  variant = 'primary',
  children,
}: DropdownProps) {
  const variants = {
    primary: 'bg-[var(--color-storacha-red)] text-white hover:bg-[#B30F10]',
    secondary: 'bg-red-100 text-[var(--color-storacha-red)] hover:bg-red-200',
    outline:
      'border-2 border-[var(--color-storacha-red)] text-[var(--color-storacha-red)] hover:bg-[var(--color-storacha-red)] hover:text-white',
    ghost:
      'text-[var(--color-storacha-red)] hover:bg-[var(--color-storacha-red)]/10',
  }

  const getAlignmentClasses = () => {
    switch (align) {
      case 'left':
        return 'left-0 origin-top-left'
      case 'center':
        return 'left-1/2 transform -translate-x-1/2 origin-top'
      case 'right':
      default:
        return 'right-0 origin-top-right'
    }
  }

  return (
    <Menu as="div" className={`relative inline-block text-left ${className}`}>
      <div className="flex justify-center">
        <Menu.Button
          className={`inline-flex items-center justify-center px-4 py-2 rounded-lg font-medium transition-all duration-200 ${variants[variant]}`}
        >
          {trigger || (
            <>
              Options
              <ChevronDownIcon
                className="ml-2 -mr-1 h-5 w-5"
                aria-hidden="true"
              />
            </>
          )}
        </Menu.Button>
      </div>
      <Transition
        as={Fragment}
        enter="transition ease-out duration-100"
        enterFrom="transform opacity-0 scale-95"
        enterTo="transform opacity-100 scale-100"
        leave="transition ease-in duration-75"
        leaveFrom="transform opacity-100 scale-100"
        leaveTo="transform opacity-0 scale-95"
      >
        <Menu.Items
          className={`absolute ${getAlignmentClasses()} mt-2 w-56 rounded-lg bg-white/95 backdrop-blur-sm shadow-lg ring-1 ring-black/5 focus:outline-none z-10 border border-gray-100 overflow-hidden`}
        >
          {children}

          <div className="py-1 max-h-80 overflow-y-auto">
            {items.length === 0 ? (
              <div className="px-4 py-3 text-sm text-gray-500 text-center italic">
                No items available
              </div>
            ) : (
              items.map((item, index) => (
                <Menu.Item key={index} disabled={item.disabled}>
                  {({ active }) => (
                    <button
                      onClick={item.onClick}
                      className={`
                        ${active ? 'bg-red-50 text-[var(--color-storacha-red)]' : 'text-gray-700'}
                        ${item.disabled ? 'opacity-50 cursor-not-allowed' : 'hover:bg-red-50 hover:text-[var(--color-storacha-red)]'}
                        group flex w-full items-center px-4 py-2.5 text-sm border-l-2
                        ${active ? 'border-l-[var(--color-storacha-red)]' : 'border-l-transparent'}
                        transition-all duration-150 ease-in-out
                      `}
                      disabled={item.disabled}
                    >
                      {item.icon && (
                        <span
                          className={`mr-3 h-5 w-5 ${active ? 'text-[var(--color-storacha-red)]' : 'text-gray-500'} group-hover:text-[var(--color-storacha-red)]`}
                        >
                          {item.icon}
                        </span>
                      )}
                      {item.label}
                    </button>
                  )}
                </Menu.Item>
              ))
            )}
          </div>
        </Menu.Items>
      </Transition>
    </Menu>
  )
}
