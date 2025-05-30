import { styled } from 'next-yak'
import { useForm } from 'react-hook-form'

import { Button, InputField, Stack } from '.'

import type { KeyMaterialImportFn } from '@/contexts/keychain'

interface KeyMaterialImportFormParams {
  keyMaterial: string
}

const FormElement = styled.form`
  margin-top: 1em;
`

export default function KeyMaterialImportForm({
  importKeyMaterial,
}: {
  importKeyMaterial: KeyMaterialImportFn
}) {
  const { register, handleSubmit, reset } =
    useForm<KeyMaterialImportFormParams>()
  async function submit(data: KeyMaterialImportFormParams) {
    await importKeyMaterial(data.keyMaterial)
    reset()
  }
  return (
    <FormElement onSubmit={handleSubmit(submit)}>
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
          Load&nbsp;Key
        </Button>
      </Stack>
    </FormElement>
  )
}
