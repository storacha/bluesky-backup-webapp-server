import { styled } from 'next-yak'
import { useState } from 'react'
import { useForm } from 'react-hook-form'

import { Button, InputField, Stack, Text } from '../ui'

export type LoginFn = (
  identifier: string,
  password: string,
  options?: { server?: string }
) => Promise<void>

export interface LoginForm {
  handle: string
  password: string
  server: string
}

export interface AtprotoLoginFormProps {
  login: LoginFn
  handle?: string
  server?: string
  defaultServer?: string
  className?: string
}

export type CreateAccountFn = (
  handle: string,
  password: string,
  email: string,
  options?: { server?: string; inviteCode?: string }
) => Promise<void>

export type CreateAccountForm = LoginForm & {
  email: string
  inviteCode?: string
}

export interface AtprotoCreateAccountFormProps {
  createAccount: CreateAccountFn
  defaultServer?: string
}

const LoginFormElement = styled.form`
  min-width: 20rem;
`

export function AtprotoLoginForm({
  login,
  handle,
  server,
  defaultServer,
}: AtprotoLoginFormProps) {
  const { register, handleSubmit, reset } = useForm<LoginForm>()
  const [errorMessage, setErrorMessage] = useState()
  const onSubmit = handleSubmit(async (data) => {
    try {
      await login(handle ?? data.handle, data.password, {
        server: server ?? data.server ?? `https://${defaultServer}`,
      })
      reset()
    } catch (e) {
      // @ts-expect-error TS doesn't know about message
      setErrorMessage(e.message)
    }
  })
  return (
    <LoginFormElement onSubmit={onSubmit}>
      <Stack $gap="1rem">
        {errorMessage && (
          <Text $color="var(--color-dark-red)">{errorMessage}</Text>
        )}
        {!server && (
          <InputField
            label="Server"
            placeholder={`https://${defaultServer}`}
            {...register('server')}
          />
        )}
        {!handle && (
          <InputField
            label="Handle"
            placeholder={`racha.${defaultServer}`}
            autoComplete="off"
            {...register('handle')}
          />
        )}
        <InputField
          label="Password"
          type="password"
          autoComplete="off"
          {...register('password')}
        />
        <Button type="submit">Log In</Button>
      </Stack>
    </LoginFormElement>
  )
}

export function AtprotoCreateAccountForm({
  createAccount,
  defaultServer,
}: AtprotoCreateAccountFormProps) {
  const { register, handleSubmit } = useForm<CreateAccountForm>()

  return (
    <LoginFormElement
      onSubmit={handleSubmit((data) =>
        createAccount(data.handle, data.password, data.email, {
          server: data.server || `https://${defaultServer}`,
          inviteCode: data.inviteCode,
        })
      )}
    >
      <Stack $gap="1rem">
        <InputField
          label="Server"
          placeholder={`https://${defaultServer}`}
          {...register('server')}
        />
        <InputField
          label="Handle"
          placeholder={`racha.${defaultServer}`}
          {...register('handle')}
        />
        <InputField
          label="Email"
          placeholder="racha@storacha.network"
          {...register('email')}
        />
        <InputField
          label="Password"
          type="password"
          {...register('password')}
        />
        <InputField label="Invite Code" {...register('inviteCode')} />
        <Button type="submit" $variant="primary">
          Create Account
        </Button>
      </Stack>
    </LoginFormElement>
  )
}

interface PlcTokenFormParams {
  token: string
}

export function PlcTokenForm({
  setPlcToken,
}: {
  setPlcToken: (token: string) => void
}) {
  const { register, handleSubmit } = useForm<PlcTokenFormParams>()

  return (
    <form onSubmit={handleSubmit((data) => setPlcToken(data.token))}>
      <Stack $gap="1rem">
        <InputField placeholder="Confirmation Code" {...register('token')} />
        <Button type="submit" $variant="primary">
          Confirm
        </Button>
      </Stack>
    </form>
  )
}
