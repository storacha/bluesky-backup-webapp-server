'use client';
import HumanodeAuthLink from '@/components/HumanodeAuthLink';
import StripePricingTable from '@/components/StripePricingTable';
import { Heading, Text, Box, Stack, Button } from '@/components/ui';
import { useMobileScreens } from '@/hooks/use-mobile-screens';
import { styled } from 'next-yak';
import { useState } from 'react';

export const PricingTableContainer = styled(Stack)`
  width: 100%;
  padding-top: 2rem;
`

export default function PlanSelector () {
  const [stripeSignup, setStripeSignup] = useState(false);
  const { isMobile } = useMobileScreens();

  return (
    <PricingTableContainer $alignItems="center" $gap="1rem">
      <Heading>Please Sign Up for a Storacha Storage Plan</Heading>
      <Text $textAlign="center" $maxWidth="45em" $fontSize="1rem">
        To start storing data on Storacha you need a storage plan. You can
        either go through our Humanode-powered biometric verification flow
        to get a limited free storage plan or sign up for a storage plan
        with a credit card below.
      </Text>
      <Text $textAlign="center" $maxWidth="45em" $fontSize="1rem">
        Either way will give you enough storage to back up most Bluesky
        accounts for quite a while.
      </Text>
      {stripeSignup ? (
        <Box $width="100%">
          <Stack $alignItems="center">
            <Button
              onClick={() => {
                setStripeSignup(false);
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
              setStripeSignup(true);
            }}
          >
            I&apos;ll sign up with my card
          </Button>
        </Stack>
      )}
    </PricingTableContainer>
  );
}
