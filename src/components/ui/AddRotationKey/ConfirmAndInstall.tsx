'use client'

import { useMobileScreens } from '@/hooks/use-mobile-screens'

import { Heading, ModalLeft, ModalRight, ModalStack, Text } from '..'
import { PlcTokenForm } from '../atproto'

export default function ConfirmAndInstall({
  installRecoveryKey,
}: {
  installRecoveryKey: (plcToken: string) => void
}) {
  const breakpoints = useMobileScreens()
  return (
    <ModalStack {...breakpoints}>
      <ModalLeft {...breakpoints}>
        <Heading>Install Recovery Key</Heading>
        <Text>
          Enter the confirmation code from your email to finish installing your
          recovery key.
        </Text>
      </ModalLeft>
      <ModalRight {...breakpoints}>
        <PlcTokenForm setPlcToken={installRecoveryKey} />
      </ModalRight>
    </ModalStack>
  )
}
