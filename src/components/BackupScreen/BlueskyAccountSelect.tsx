'use client'

import { useStorachaAccount } from '@/hooks/use-plan'
import { useSWR } from '@/lib/swr'

import { ActionButton } from '../ActionButton'
import { Loader } from '../Loader'

import { Select } from './Select'

export const BlueskyAccountSelect = ({
  name,
  defaultValue,
  disabled = false,
}: {
  name: string
  defaultValue?: string
  disabled?: boolean
}) => {
  const account = useStorachaAccount()

  const { data: atprotoAccounts, isLoading } = useSWR(
    disabled ? null : account && ['api', '/api/atproto-accounts']
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
    atprotoAccounts?.map((did) => ({ id: did, label: did })) ??
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
      content={isLoading ? <Loader /> : undefined}
      actionLabel="Connect Bluesky account…"
      actionOnPress={connectNewAccount}
      defaultSelectedKey={defaultValue}
      isDisabled={disabled}
      actionButton={
        <ActionButton
          actionLabel="Connect Bluesky account..."
          actionOnPress={connectNewAccount}
        />
      }
    />
  )
}
