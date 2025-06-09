import { useForm } from 'react-hook-form'

import { RotationKey } from '@/types'

import { Button, InputField, Stack } from '.'

import type { KeyHydrateFn } from '@/contexts/keychain'

interface KeyImportFormParams {
  keyMaterial: string
}

export default function KeyImportForm({
  rotationKey,
  importKey,
}: {
  rotationKey: RotationKey
  importKey: KeyHydrateFn
}) {
  const { register, handleSubmit } = useForm<KeyImportFormParams>()
  async function submit(data: KeyImportFormParams) {
    await importKey(rotationKey, data.keyMaterial)
  }
  return (
    <form onSubmit={handleSubmit(submit)}>
      <Stack $direction="row" $gap="0.5rem">
        <InputField
          type="password"
          data-1p-ignore
          placeholder="M..."
          label="Private Key"
          {...register('keyMaterial')}
        />
        <Button
          type="submit"
          $variant="primary"
          className="text-xs uppercase font-bold"
        >
          Load
        </Button>
      </Stack>
    </form>
  )
}
