'use client'

import { useMobileScreens } from '@/hooks/use-mobile-screens'

import { Heading, ModalLeft, ModalRight, ModalStack, Spinner, Text } from '..'
import { AtprotoLoginForm, LoginFn } from '../atproto'

export default function LoginToServer({
  server,
  handle,
  loginToPDS,
}: {
  server?: string
  handle?: string
  loginToPDS: LoginFn
}) {
  const breakpoints = useMobileScreens()

  return (
    <ModalStack {...breakpoints}>
      <ModalLeft {...breakpoints}>
        <Heading>Install Recovery Key</Heading>
        <Text>
          Log in to {server} as {handle}.
        </Text>
        <Text>
          Your password won&apos;t be stored or sent to our servers - when you
          reload the page you&apos;ll be logged back out of {server}.
        </Text>
      </ModalLeft>
      <ModalRight $justifyContent="center" {...breakpoints}>
        {handle && server ? (
          <AtprotoLoginForm
            login={loginToPDS}
            handle={handle}
            server={server}
          />
        ) : (
          <Spinner />
        )}
      </ModalRight>
    </ModalStack>
  )
}
