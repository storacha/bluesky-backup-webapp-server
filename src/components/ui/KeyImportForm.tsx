import { useForm } from 'react-hook-form'

import { RotationKey } from '@/types'

import { Button, InputField } from '.'

import type { KeyImportFn } from '@/contexts/keychain'

interface KeyImportFormParams {
  keyMaterial: string
}

export default function KeyImportForm({
  dbKey,
  importKey,
}: {
  dbKey: RotationKey
  importKey: KeyImportFn
}) {
  const { register, handleSubmit } = useForm<KeyImportFormParams>()
  async function submit(data: KeyImportFormParams) {
    await importKey(dbKey, data.keyMaterial)
  }
  return (
    <form onSubmit={handleSubmit(submit)} className="flex flex-col space-y-2">
      <InputField
        type="password"
        className="w-full whitespace-pre"
        placeholder="Private Key"
        {...register('keyMaterial')}
      />
      <Button
        type="submit"
        $variant="primary"
        className="text-xs uppercase font-bold"
      >
        Confirm
      </Button>
    </form>
  )
}
