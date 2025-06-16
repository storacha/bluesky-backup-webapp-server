'use client'
import { styled } from 'next-yak'
import { useState } from 'react'

import HumanodeAuthLink from '@/components/HumanodeAuthLink'
import StripePricingTable from '@/components/StripePricingTable'
import { Box, Button, Heading, Stack, Text } from '@/components/ui'
import { useBBAnalytics } from '@/hooks/use-bb-analytics'
import { useMobileScreens } from '@/hooks/use-mobile-screens'
import { useStorachaAccount } from '@/hooks/use-plan'

const PricingTableContainer = styled(Stack)`
  width: 100%;
  padding-top: 2rem;
`

const PricingText = styled(Text)`
  font-size: 1rem;
  text-align: center;
`

const PricingExplanation = styled(Stack)`
  gap: 1rem;
  margin-top: 1rem;
  margin-bottom: 2rem;
  max-width: 29em;
`

export default function PlanSelector() {
  const [stripeSignup, setStripeSignup] = useState(false)
  const { isMobile } = useMobileScreens()
  const { logPlanSelection } = useBBAnalytics()
  const account = useStorachaAccount()
  return (
    <PricingTableContainer $alignItems="center" $gap="1rem">
      <Heading>Please Sign Up for a Storacha Storage Plan</Heading>
      <PricingExplanation>
        <PricingText>
          To start storing data on Storacha you need a storage plan. The easiest
          way to get one is a quick face check - no account, no credit card, and{' '}
          <b>no biometric data is stored. Ever.</b>
        </PricingText>
        <PricingText>
          Alternatively, you can choose one of our paid storage plans by
          providing credit card information using Stripe.
        </PricingText>
        <PricingText>
          Either way will give you enough storage to back up most Bluesky
          accounts for quite a while.
        </PricingText>
      </PricingExplanation>
      {stripeSignup ? (
        <Box $width="100%">
          <Stack $alignItems="center">
            <Button
              onClick={() => {
                setStripeSignup(false)
              }}
            >
              Back
            </Button>
            <StripePricingTable />
          </Stack>
        </Box>
      ) : (
        <Stack $direction={isMobile ? 'column' : 'row'} $gap="1rem">
          <HumanodeAuthLink />
          <Button
            onClick={() => {
              logPlanSelection({ userId: account?.did() })
              setStripeSignup(true)
            }}
          >
            I&apos;ll Sign Up With My Card
          </Button>
        </Stack>
      )}
    </PricingTableContainer>
  )
}
