import { styled } from 'next-yak'

import { Loader } from '@/components/Loader'

import { LoginScreen } from '../components/LoginScreen'

import { Authenticated } from './authentication'
import { LoggedIn } from './LoggedIn'

const FullscreenForLoader = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;

  display: flex;
  justify-content: center;
  align-items: center;

  background-color: var(--color-gray-light);
`

export default function Home() {
  return (
    <Authenticated
      loading={
        <FullscreenForLoader>
          <Loader />
        </FullscreenForLoader>
      }
      unauthenticated={<LoginScreen />}
    >
      <LoggedIn />
    </Authenticated>
  )
}
