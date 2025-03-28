import { Authenticated, LogOutButton } from './authentication'
import { LoginScreen } from '../components/LoginScreen'

export default function Home() {
  return (
    <Authenticated unauthenticated={<LoginScreen />}>
      <div>Authenticated</div>
      <LogOutButton>Log Out</LogOutButton>
    </Authenticated>
  )
}
