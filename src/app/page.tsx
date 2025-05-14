import { styled } from 'next-yak'

import { FullscreenLoader } from '@/components/Loader'
import { Stack } from '@/components/ui'

import { LoginScreen } from '../components/LoginScreen'

import { Authenticated } from './authentication'
import { LoggedIn } from './LoggedIn'

const Outside = styled(Stack)`
  min-height: 100vh;
  align-items: stretch;
`

export default function Home() {
  return (
    <Authenticated
      loading={
        <Outside>
          <FullscreenLoader />
        </Outside>
      }
      unauthenticated={<LoginScreen />}
    >
      <LoggedIn />
    </Authenticated>
  )
}
