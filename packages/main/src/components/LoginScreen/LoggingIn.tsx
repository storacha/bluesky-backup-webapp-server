import { Button, Stack } from '@/components/ui'
import { B, H3 } from './components'

export const LoggingIn = ({
  email,
  cancelLogin,
}: {
  email: string | undefined
  cancelLogin: () => void
}) => {
  return (
    <Stack $gap="2rem">
      <H3>Almost there…</H3>
      <p>
        We&apos;ve sent a verification email to <B>{email}</B>. Click the link
        in that email to log in.
      </p>
      <Button onClick={cancelLogin}>Cancel</Button>
    </Stack>
  )
}
