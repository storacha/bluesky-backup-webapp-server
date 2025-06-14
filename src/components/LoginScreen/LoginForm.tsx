import { Button, Stack } from '@/components/ui'
import { useBBAnalytics } from '@/hooks/use-bb-analytics'

import { H3, H4, Input } from './components'

export const LoginForm = ({
  email,
  setEmail,
}: {
  email: string | undefined
  setEmail: (email: string) => void
}) => {
  const { logLoginStarted } = useBBAnalytics()
  return (
    <Stack $gap="2rem">
      <Stack $gap="0.5rem">
        <H3>First, log in to Storacha</H3>
        <H4>
          If you don&rsquo;t have an account, we&rsquo;ll create one for you.
        </H4>
      </Stack>
      <Input>
        <label>Email address</label>
        <input
          type="email"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value)
          }}
        />
      </Input>
      <Button
        type="submit"
        onClick={() => {
          logLoginStarted({ method: 'email' })
        }}
      >
        Log in
      </Button>
    </Stack>
  )
}
