import { LoginScreen } from '../components/LoginScreen'

import { Authenticated } from './authentication'
import { LoggedIn } from './LoggedIn'

export default function Home() {
  return (
    <Authenticated unauthenticated={<LoginScreen />}>
      <LoggedIn />
    </Authenticated>
  )
}
