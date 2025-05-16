'use client'
import * as Storacha from '@storacha/client/account'
import { useAuthenticator } from '@storacha/ui-react'
import { useContext } from 'react'
import { SelectStateContext } from 'react-aria-components'

import { useDisclosure } from '@/hooks/use-disclosure'
import { shortenDID } from '@/lib/ui'

import { ActionButton } from '../ActionButton'
import { CreateSpaceModal } from '../modals'

import { Select } from './Select'

const CreateNewSpaceButton = ({ onOpen }: { onOpen: () => void }) => {
  return (
    <ActionButton actionLabel="Create new space..." actionOnPress={onOpen} />
  )
}

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
  const state = useContext(SelectStateContext)
  const { isOpen, onClose, onOpen } = useDisclosure()

  const handleSpaceCreated = (spaceId: string) => {
    onClose()
    const label = `${shortenDID(spaceId)}`
    state?.setSelectedKey(label)
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
        actionButton={<CreateNewSpaceButton onOpen={onOpen} />}
      />
      <CreateSpaceModal
        isOpen={isOpen}
        onClose={onClose}
        account={account as Storacha.Account}
        onSpaceCreated={handleSpaceCreated}
      />
    </>
  )
}
