'use client'

import { Did, isDid } from '@atproto/api'

import { useSWR } from '@/lib/swr'

import { ActionButton } from '../ActionButton'

import { Select } from './Select'

export const BlueskyAccountSelect = ({
  name,
  defaultValue,
  disabled = false,
}: {
  name: string
  defaultValue?: Did
  disabled?: boolean
}) => {
  const { data: atprotoAccounts } = useSWR(
    disabled ? null : ['api', '/api/atproto-accounts']
  )

  const connectNewAccount = () => {
    const width = 500
    const height = 600
    const left = window.screenX + (window.outerWidth - width) / 2
    const top = window.screenY + (window.outerHeight - height) / 2

    window.open(
      '/atproto/connect',
      'atproto-connect',
      `width=${width},height=${height},top=${top},left=${left},resizable=yes,scrollbars=yes`
    )
  }

  const items =
    // The accounts loaded from the API, or if they're not loaded...
    atprotoAccounts?.map((did) => {
      if (!isDid(did)) {
        throw new Error(`Invalid DID: ${did}`)
      }
      return {
        id: did,
        label: did,
      }
    }) ??
    // ...the default value, so at least that's visible.
    [
      !!defaultValue && {
        id: defaultValue,
        label: defaultValue,
      },
    ].filter((a) => !!a)

  return (
    <Select
      name={name}
      label="Bluesky account"
      imageSrc="/bluesky.png"
      items={items}
      defaultSelectedKey={defaultValue}
      isDisabled={disabled}
      renderItemValue={(item) => {
        return <ATHandle did={item.id} />
      }}
      actionButton={
        <ActionButton
          actionOnPress={connectNewAccount}
          actionLabel="Connect Bluesky account..."
        />
      }
    />
  )
}

const ATHandle = ({ did }: { did: string }) => {
  const { data: profile } = useSWR(isDid(did) && ['atproto-profile', did])
  return profile?.handle ? `@${profile.handle}` : did
}
