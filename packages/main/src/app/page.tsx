import { Authenticated } from './authentication'
import { LoginScreen } from '../components/LoginScreen'
import { LoggedIn } from './LoggedIn'

export default function Home() {
  return (
    <Authenticated unauthenticated={<LoginScreen />}>
      <LoggedIn />
    </Authenticated>
  )
}
