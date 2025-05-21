'use client'

import { useEffect } from 'react'

import { Box, Button, Center, Heading, Stack, Text } from '@/components/ui'
import { logAndCaptureError } from '@/lib/sentry'

import { ConnectStack } from './ui'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    logAndCaptureError(error)
  }, [error])

  return (
    <Center $height="100vh">
      <ConnectStack $gap="1.2rem" $width="100%">
        <Stack>
          <Heading>Connect your Bluesky Account</Heading>
        </Stack>
        <Text $fontSize="1em">Oh no - something went wrong:</Text>
        <Box $borderStyle="solid">
          <Text $fontSize="0.75em">{error.message}</Text>
        </Box>
        <Button onClick={() => reset()}>Try Again</Button>
      </ConnectStack>
    </Center>
  )
}
