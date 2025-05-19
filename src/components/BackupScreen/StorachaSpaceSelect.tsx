'use client'
import { useAuthenticator } from '@storacha/ui-react'
import { useContext, useState } from 'react'
import { SelectStateContext } from 'react-aria-components'
import { SelectState } from 'react-stately'

import { shortenDID } from '@/lib/ui'

import { ActionButton } from '../ActionButton'
import { CreateSpaceModal } from '../modals'

import { Select } from './Select'

const CreateNewSpaceButton = ({
  onOpenNewSpaceModal,
}: {
  onOpenNewSpaceModal: (newSession: {
    selectState: SelectState<unknown>
  }) => void
}) => {
  const state = useContext(SelectStateContext)
  return (
    // Until there's a select state, we can't show the button, because we
    // wouldn't be able to handle the click.
    state && (
      <ActionButton
        actionLabel="Create new space..."
        actionOnPress={() => {
          onOpenNewSpaceModal({ selectState: state })
        }}
      />
    )
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

  /** `null` means "no modal session", ie, "closed". */
  const [modalSession, setModalSession] = useState<{
    selectState: SelectState<unknown>
  } | null>(null)

  return (
    <>
      <Select
        defaultSelectedKey={defaultValue}
        isDisabled={disabled}
        name={name}
        label="Storacha space"
        imageSrc="/storacha-red.png"
        items={storachaSpaces}
        externalButton={
          <CreateNewSpaceButton onOpenNewSpaceModal={setModalSession} />
        }
      />
      {account && (
        <CreateSpaceModal
          isOpen={!!modalSession}
          onClose={() => {
            setModalSession(null)
          }}
          account={account}
          onSpaceCreated={(spaceId: string) => {
            // TS doesn't know this, but `modalSession` is always present here;
            // if it weren't, the modal wouldn't be open.
            modalSession?.selectState.setSelectedKey(spaceId)
            setModalSession(null)
          }}
        />
      )}
    </>
  )
}
