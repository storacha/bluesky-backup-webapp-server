'use client'

import { Agent } from '@atproto/api'
import { useState } from 'react'

import { useMobileScreens } from '@/hooks/use-mobile-screens'

import { Button, Heading, ModalLeft, ModalRight, ModalStack, Text } from '..'

export default function SendConfirmationEmail({
  agent,
  server,
  onDone,
}: {
  agent?: Agent
  server?: string
  onDone: () => void
}) {
  const [isSendingEmail, setIsSendingEmail] = useState(false)
  async function sendPlcAuthorizationEmail() {
    if (!agent)
      throw new Error(
        'could not send PLC operation authorization, agent is not truthy'
      )
    setIsSendingEmail(true)
    try {
      await agent.com.atproto.identity.requestPlcOperationSignature()
      onDone()
    } finally {
      setIsSendingEmail(false)
    }
  }
  const breakpoints = useMobileScreens()
  return (
    <ModalStack {...breakpoints}>
      <ModalLeft {...breakpoints}>
        <Heading>Confirm Operation</Heading>
        <Text>
          To register your new recovery key you must provide a confirmation code
          sent to the email registered with {server}.
        </Text>
      </ModalLeft>
      <ModalRight {...breakpoints} $justifyContent="center">
        <Button
          onClick={sendPlcAuthorizationEmail}
          disabled={isSendingEmail}
          $variant="primary"
        >
          Send Confirmation Email
        </Button>
      </ModalRight>
    </ModalStack>
  )
}
