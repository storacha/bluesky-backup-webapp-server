'use client'

import { DID, useW3 } from '@storacha/ui-react'
import { styled } from 'next-yak'
import { ReactNode } from 'react'
interface PickerProps {
  pick: (planID: DID, freeTrial?: boolean) => void
  planID: DID
  freeTrial?: boolean
}

type PickPlanButtonProps = PickerProps & {
  children: ReactNode
}

const PickPlanButton = styled.button`
  background-color: var(--color-dark-red);
  flex-shrink: 1;
  border-radius: calc(infinity * 1px);
  color: var(--color-white);
  padding: 0.5rem 1rem;
  text-align: center;
  cursor: pointer;
`

function PickPlan({
  pick,
  planID,
  freeTrial = false,
  children,
}: PickPlanButtonProps) {
  return (
    <PickPlanButton onClick={() => pick(planID, freeTrial)}>
      {children}
    </PickPlanButton>
  )
}

type PlanPickerProps = PickerProps & {
  name: string
  peppers: number
  price: number
  storage: string
  overage: number
}

const PlanPickerBody = styled.div`
  border: 2px solid var(--color-dark-red);
  border-radius: 0.75rem;
  background-color: var(--color-white);
`

const PlanPickerHeader = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding: 0.5rem 1rem;
  border-bottom: 2px solid var(--color-dark-red);
`

const PlanPickerTitle = styled.h1`
  color: var(--color-dark-red);
  text-transform: uppercase;
`

const PlanPickerContent = styled.div`
  padding: 1rem;
  text-align: left;
  color: var(--color-dark-red);
  display: flex;
  flex-direction: column;
`

const PlanPickerPrice = styled.h2`
  font-size: 2.25rem;
  font-weight: bold;
`

const PlanPickerSection = styled.div`
  padding: 1rem 0;
`

const PlanPickerSectionTitle = styled.h3`
  font-size: 1.25rem;
`

const PlanPickerSectionSubtitle = styled.h5`
  font-size: 1rem;
  font-weight: normal;
`

const PricingTableContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2rem;

  @media (min-width: 768px) {
    flex-direction: row;
  }
`

function PlanPicker({
  name,
  peppers,
  price,
  storage,
  overage,
  pick,
  planID,
  freeTrial,
}: PlanPickerProps) {
  return (
    <PlanPickerBody>
      <PlanPickerHeader>
        <PlanPickerTitle>{name}</PlanPickerTitle>
        <span>{'🌶️'.repeat(peppers)}</span>
      </PlanPickerHeader>
      <PlanPickerContent>
        <PlanPickerPrice>${price}/mo</PlanPickerPrice>
        <PlanPickerSection>
          <PlanPickerSectionTitle>{storage} Storage</PlanPickerSectionTitle>
          <PlanPickerSectionSubtitle>
            Additional at ${overage}/GB per month
          </PlanPickerSectionSubtitle>
        </PlanPickerSection>
        <PlanPickerSection>
          <PlanPickerSectionTitle>{storage} Egress</PlanPickerSectionTitle>
          <PlanPickerSectionSubtitle>
            Additional at ${overage}/GB per month
          </PlanPickerSectionSubtitle>
        </PlanPickerSection>
        <PickPlan pick={pick} planID={planID} freeTrial={freeTrial}>
          Start Storing
        </PickPlan>
      </PlanPickerContent>
    </PlanPickerBody>
  )
}

interface PricingTableProps {
  freeTrial?: boolean
  redirectAfterCheckout?: boolean
}

interface CreateCheckoutSessionProps {
  planID: DID
  freeTrial?: boolean
  successURL?: string
  cancelURL?: string
  redirectAfterCompletion?: boolean
}

function createSuccessUrl(){
  const u = new URL(location.href)
  u.searchParams.append("checkout-success", "true")
  return u.href
}

function createCancelUrl() {
  const u = new URL(location.href)
  u.searchParams.append("checkout-success", "false")
  return u.href
}


export default function StripePricingTable({
  freeTrial = false,
  redirectAfterCheckout = true,
}: PricingTableProps) {
  const [{ accounts, client }] = useW3()
  const account = accounts[0]
  async function startCheckoutSession(planID: DID) {
    if (!client) {
      throw new Error(
        'tried to create checkout session but storacha client is not defined'
      )
    }
    if (!account) {
      throw new Error(
        'tried to create checkout session but storacha account is not defined'
      )
    }

    const checkoutProps: CreateCheckoutSessionProps = {
      planID,
      freeTrial,
    }
    if (redirectAfterCheckout) {
      checkoutProps.successURL = createSuccessUrl()
      checkoutProps.cancelURL = createCancelUrl()
    } else {
      checkoutProps.redirectAfterCompletion = false
    }
    const response = await client?.capability.plan.createCheckoutSession(
      account.did(),
      checkoutProps
    )
    window.open(response.url)
  }
  return (
    <PricingTableContainer>
      <PlanPicker
        name="Starter"
        peppers={1}
        price={0}
        storage="5GB"
        overage={0.15}
        planID="did:web:starter.storacha.network"
        pick={startCheckoutSession}
        freeTrial={freeTrial}
      />
      <PlanPicker
        name="Lite"
        peppers={2}
        price={10}
        storage="100GB"
        overage={0.05}
        planID="did:web:lite.storacha.network"
        pick={startCheckoutSession}
        freeTrial={freeTrial}
      />
      <PlanPicker
        name="Business"
        peppers={3}
        price={100}
        storage="2TB"
        overage={0.03}
        planID="did:web:business.storacha.network"
        pick={startCheckoutSession}
        freeTrial={freeTrial}
      />
    </PricingTableContainer>
  )
}
