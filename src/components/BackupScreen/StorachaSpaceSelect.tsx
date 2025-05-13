'use client'

import { useAuthenticator } from '@storacha/ui-react'

import { useDisclosure } from '@/hooks/use-disclosure'
import { shortenDID } from '@/lib/ui'

import { CreateSpaceModal } from '../modals'

import { Select } from './Select'

export const StorachaSpaceSelect = ({
  name,
  defaultValue,
  disabled,
}: {
  name: string
  defaultValue?: string
  disabled?: boolean
}) => {
  const [{ spaces, accounts }] = useAuthenticator()
  const account = accounts[0]

  const storachaSpaces = spaces.map((space) => ({
    id: space.did(),
    label: `${space.name} (${shortenDID(space.did())})`,
  }))

  const { isOpen, onOpen, onClose } = useDisclosure()

  const handleSpaceCreated = () => {
    onClose()
  }

  return (
    <>
      <Select
        defaultSelectedKey={defaultValue}
        isDisabled={disabled}
        name={name}
        label="Storacha space"
        imageSrc="/storacha-red.png"
        items={storachaSpaces}
        actionLabel="Create new space…"
        actionOnPress={onOpen}
      />
      <CreateSpaceModal
        isOpen={isOpen}
        onClose={onClose}
        // @ts-expect-error i don't want to set the prop type in the modal as `Storacha.Account | undefined`
        account={account as Storacha.Account}
        onSpaceCreated={handleSpaceCreated}
      />
    </>
  )
}
