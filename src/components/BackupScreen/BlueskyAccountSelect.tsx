'use client'

import { useStorachaAccount } from '@/hooks/use-plan'
import { useSWR } from '@/lib/swr'

import { Loader } from '../Loader'

import { Select } from './Select'

export const BlueskyAccountSelect = (props: {
  name: string
  defaultValue?: string
  onChange?: (value: string) => void
  disabled?: boolean
}) => {
  const account = useStorachaAccount()

  const { data: atprotoAccounts, isLoading } = useSWR(
    props.disabled ? null : account && ['api', '/api/atproto-accounts']
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
  return (
    <Select
      label="Bluesky account"
      imageSrc="/bluesky.png"
      items={atprotoAccounts?.map((did) => ({ id: did, label: did }))}
      content={isLoading ? <Loader /> : undefined}
      actionLabel="Connect Bluesky account…"
      actionOnPress={connectNewAccount}
    />
  )
}
